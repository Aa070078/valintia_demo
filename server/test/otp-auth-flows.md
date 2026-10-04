# OTP authentication flows

These flows use the existing Redis, MailService/SMTP, bcrypt and Nest JWT
infrastructure. The identity update on `feat/s2-engineer-review-workflow` requires
the user-email-identity migration. LOGIN and PASSWORD_RESET now resolve verified
real `email`, rather than `username`, and reject incomplete internal accounts.
Historical customers retain password login but must verify their backfilled email
before using email OTP/recovery. Temporary identifiers are never mail destinations.
See [account lifecycle and Swagger steps](../../.claude/docs/ai/account-provisioning/api-handoff.md).

## Configuration

Configure `PASSWORD_RESET_TOKEN_SECRET` with a separate random secret in your
local environment; it must differ from the access and email-verification secrets.
`PASSWORD_RESET_TOKEN_EXPIRES_IN` defaults to `15m`. Placeholder values are in
`server/.env.example`; actual local secrets were not changed.

Missing/reused reset secrets prevent startup. JWTs are signed with HS256.
Registration still uses `EMAIL_VERIFICATION_TOKEN_SECRET` and its existing expiry.

## Architecture

```text
EMAIL VERIFICATION:
OTP -> verificationToken -> register

PASSWORD RESET:
OTP -> passwordResetToken -> reset password

LOGIN:
OTP -> authentication -> accessToken
```

- `OtpService` owns temporary challenges: normalized emails, purpose-scoped Redis
  keys, cooldown, random generation, TTL, attempt counting and consumption.
- `OtpProofService` connects a successful challenge to the registration/reset
  proof services. It keeps orchestration out of both controllers and OTP mechanics.
- `EmailVerificationService` issues the unchanged short-lived registration proof.
- `PasswordResetTokenService` issues reset proof containing normalized email,
  user ID (`sub`), `purpose: PASSWORD_RESET`, `type: password_reset`, a fingerprint
  of the current bcrypt hash (`passwordVersion`), and JWT timing claims.
- `AuthService` requests account-bound OTPs, consumes reset proofs and authenticates
  LOGIN challenges. Password login and OTP login use the same access-token helper.

Reset-password derives the account entirely from verified token claims; callers
cannot supply a different email/user ID. It compares those claims to the current
account and uses a conditional database update with the old password hash.
One competing reset can succeed; password changes invalidate all reset proofs
bound to the old hash. No plaintext password or bcrypt hash is included in the JWT.

Access JWTs contain the existing `{ sub, role, iat, exp }` claims, expire after one
hour, and use the normal login secret. Registration and reset proofs cannot be
used as access credentials, and neither proof is accepted by the other consumer.

## Swagger sequence

Open `http://localhost:5000/docs` (adjust the configured port). Replace the example
emails with inboxes you control. Use **Try it out** for each operation.

### Registration (preserved)

1. `POST /api/otp/send`:
   ```json
   { "email": "new@example.com", "purpose": "EMAIL_VERIFICATION" }
   ```
2. Read the inbox and `POST /api/otp/verify`:
   ```json
   { "email": "new@example.com", "otp": "123456", "purpose": "EMAIL_VERIFICATION" }
   ```
   Expect 200 with `verificationToken`.
3. `POST /api/auth/register`:
   ```json
   { "username": "new@example.com", "password": "Password123!", "verificationToken": "PASTE_TOKEN" }
   ```
   Expect 201 CUSTOMER. Existing duplicate registration remains 409 after valid proof.

### Password reset

1. `POST /api/auth/forgot-password`:
   ```json
   { "email": "customer@example.com" }
   ```
   Expect generic 200 regardless of account existence, cooldown or delivery failure.
   Account lookup and delivery happen in-process after the request is accepted.
2. Read the inbox and `POST /api/otp/verify`:
   ```json
   { "email": "customer@example.com", "otp": "123456", "purpose": "PASSWORD_RESET" }
   ```
   Expect 200 with `passwordResetToken`, never `verificationToken`.
3. `POST /api/auth/reset-password`:
   ```json
   { "passwordResetToken": "PASTE_TOKEN", "newPassword": "NewPassword123!" }
   ```
   Expect 200. The minimum password length is six, matching existing conventions.
4. Repeat step 3 with the same proof: expect 400. Login with the old password:
   expect 401; login with the new password: expect 200.

### OTP login

1. `POST /api/auth/login/otp/request`:
   ```json
   { "email": "customer@example.com" }
   ```
   Expect the same generic 200 response as forgot-password. No purpose is accepted.
2. Read the inbox and `POST /api/auth/login/otp/verify`:
   ```json
   { "email": "customer@example.com", "otp": "123456" }
   ```
   Expect 200 with `accessToken` and the same `user` response as password login.
   No registration/reset proof is returned.
3. Use `accessToken` in Swagger's **Authorize** dialog and call `GET /api/auth/me`.
   Expect the matching user identity. Replay the LOGIN OTP: expect 401.

`/api/otp/send` now accepts registration requests only; reset/login must use their
dedicated request endpoints. `/api/otp/verify` accepts EMAIL_VERIFICATION and
PASSWORD_RESET, and rejects LOGIN before consuming its challenge. Invalid OTP
verification returns 400; dedicated LOGIN verification uses a generic 401.

## Attempts, concurrency, and limits

At `maxAttempts=5`, a fifth wrong code leaves the record stored with five attempts.
The sixth request removes it before comparison, including a correct sixth code.
This existing policy is preserved. Recommended future semantics: remove immediately
on the fifth failed attempt, rather than waiting for another request.

Redis compare-and-swap atomically preserves remaining TTL and updates/consumes an
unchanged record. Stale reads retry; parallel failures count individually, one
success consumes the OTP, and failed writes cannot resurrect a consumed challenge.
Cooldown is reserved atomically with SET NX and applies independently of challenge TTL.
GENERAL was removed:
only enum/comment/DTO message references existed, with no legitimate application use.

Remaining limitations:

- Existing access JWTs are stateless and remain valid until expiry after reset;
  no session revocation or refresh-token flow is implemented.
- Account OTP requests use best-effort in-process delivery, not a durable queue.
  A process exit can lose pending work. Requests return generic responses and do
  not wait for account lookup or email-provider latency.
- Registration verificationToken remains reusable until expiry, preserving its
  existing behavior. Reset proof becomes unusable after any password change.
- There is no new global/IP request limiter. Existing per-email/purpose cooldown
  and challenge attempt limits remain; these alone are not comprehensive abuse control.
- OTP login requires the actual verified real email field and completed internal
  onboarding. Profile usernames and temporary identifiers never receive login OTPs.
- Live SMTP delivery and real PostgreSQL password changes were not tested here.

## Automated checks

From `server/` on Windows:

```powershell
npx.cmd tsc --noEmit
npm.cmd run test:auth-otp
npm.cmd run test:redis-otp
npm.cmd test -- --runInBand
```

`test:auth-otp` builds and tests actual compiled Nest modules/controllers, validation,
bcrypt and JWTs over HTTP with isolated database/mail/Redis adapters. It covers
success, invalid/expired proofs and challenges, account/user/email mismatches,
purpose isolation, generic background responses, password changes, replay and
concurrency. `test:email-verification` also runs this comprehensive suite, replacing
its previously missing test-file target.

`test:redis-otp` builds and exercises the actual Lua compare-and-swap against local
Redis using `.env` connection settings and a temporary UUID-named test key, cleaned
up afterward. It verifies TTL preservation, stale-update rejection, one consumer,
and one cooldown reservation under concurrent requests.
The existing Jest auth suites still have baseline ESM/.js resolution failures;
`test:e2e` references a missing `test/jest-e2e.json` configuration.
