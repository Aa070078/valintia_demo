# API Handoff: Internal account provisioning and verified-email identity

## Root cause and implemented identity model

Previously `username` was both application identity and the email lookup used by
OTP/recovery. Administrator provisioning could create a non-email username, and
the JWT guard did not check onboarding state. Such users had business access but
no real recovery identity.

`username` is now stable application identity. `email` is nullable, unique,
normalized and real; `emailVerified` records inbox verification. `temporaryLogin`
is a unique provisioning identifier, **not an email**. The backend never mails it.
Only bcrypt hashes are stored for passwords. Names/birth year generate usernames;
the current schema has no profile entity to persist those inputs separately.

Internal roles (ENGINEER, PROJECT_MANAGER, COMPANY_OWNER) become active only with
verified real email and `mustChangePassword=false`. Customers and the existing
administrator password-access policy is preserved; both now require an actual email field.

## Token boundary and authorization

- Active login returns `accessToken`, normal `{ sub, role }` application claims,
  standard `iat/exp`, one-hour expiry, and safe user identity.
- Incomplete internal login returns **only** `onboardingToken`,
  `onboardingRequired=true`, and safe identity. It never returns `accessToken`.
- `onboardingToken` lasts 15 minutes and carries `scope=onboarding` and an opaque
  server credential-generation version. It contains no password/hash.
- The shared JWT guard checks current database identity, role, onboarding state,
  credential generation and expiry. Restricted tokens are accepted only by the
  explicit account endpoints below; no projects/review/user administration.
- Both steps revoke onboarding sessions. Sign in again with verified email and
  the new password. Old restricted sessions do not upgrade to application access.
- Provisioning/migration/reissue persists `accessTokensValidAfter`; legacy normal
  JWTs predating that cutoff stay revoked after activation. Normal login can wait
  up to one second to cross JWT timestamp precision at the cutoff.
- Role changes/deleted accounts invalidate access at the shared guard. Existing
  password resets still do not revoke ordinary stateless access JWTs.

## Endpoints and exact bodies

### POST /api/users — ADMINISTRATOR only, 201

```json
{
  "firstName": "Abd",
  "lastName": "Mohamed",
  "birthYear": 1998,
  "role": "ENGINEER"
}
```

Only these fields are accepted. Names are required, trimmed, nonempty and at most
80 characters; birthYear is an integer 1900–2100. Internal role must be ENGINEER,
PROJECT_MANAGER or COMPANY_OWNER. Username/email/password inputs are rejected.

```json
{
  "id": 66,
  "username": "AbdMoh98",
  "temporaryLogin": "abdmoh98@internal.local",
  "temporaryPassword": "Tmp!<generated-random-value>",
  "role": "ENGINEER",
  "emailVerified": false,
  "mustChangePassword": true,
  "temporaryCredentialsExpiresAt": "2026-10-06T12:00:00.000Z",
  "createdAt": "2026-10-04T12:00:00.000Z"
}
```

Uniqueness constraints arbitrate concurrent creation. Collision suffixes are
`_2`, `_3`, etc. Non-Latin names use a neutral ASCII stem when transliteration
is unavailable. Password uses cryptographic random bytes and bcrypt cost 10.
The plaintext is returned only in this provisioning response. No passwordHash
or generation secret is returned. Errors: 400 validation, 401 authentication,
403 role/onboarding rejection, 409 allocation exhausted.

### POST /api/auth/login — public, 200

```json
{
  "email": "abdmoh98@internal.local",
  "password": "<temporary-password>"
}
```

`email` is a login identifier field and deliberately uses string validation so
temporary identifiers work. Only `email` and `password` are accepted, both required.
Additional properties (including `username`) are rejected. Service resolves only
the actual email field, or temporaryLogin while incomplete. Profile usernames
are never a fallback, including email-shaped administrator usernames.

```json
{
  "onboardingToken": "<restricted-signed-token>",
  "onboardingRequired": true,
  "user": {
    "id": 66,
    "username": "AbdMoh98",
    "email": null,
    "emailVerified": false,
    "role": "ENGINEER",
    "mustChangePassword": true,
    "onboardingRequired": true
  }
}
```

Provisioning credentials expire after 48 hours by default; ConfigModule loads
`INTERNAL_PROVISIONING_TTL_HOURS`, restricted to integers 24–72. Expiry applies
to temporary login and onboarding sessions. Temporary-login budget is five total
attempts per identifier per 15 minutes, including successes/unknown temporary
identifiers. Real-email login while incomplete shares the same account budget.
Redis reservations/CAS preserve TTL and prevent concurrent bypass; failure of the
limiter fails closed. 400 invalid contract, 401 invalid/expired credentials,
429 attempt limit. No global/IP abuse-control layer was added.

### GET /api/auth/me — accessToken or onboardingToken, 200

Returns the safe user object above; frontend reads actual state here. Invalid,
expired, revoked or stale-role sessions return 401. No arbitrary verification
flags supplied by clients are accepted.

### POST /api/auth/onboarding/email/request — authenticated, 200

```json
{ "email": "engineer@example.com" }
```

Use onboardingToken. Real email is normalized/validated and checked for ownership.
No email is persisted here. Request another code using this same endpoint and existing cooldown.
Purpose is fixed EMAIL_VERIFICATION. OTP is sent only to the real inbox; response
contains `success`, `message`, `expiresInSeconds`, `cooldownSeconds`.
The authenticated account ID and current generation namespace the existing OTP
challenge. They are never accepted from the body. Public OTP endpoints cannot
consume it. 400 invalid/temporary destination, 401 revoked/expired session,
403 absent onboarding context, 409 email assigned/already verified, 429 cooldown.

### POST /api/auth/onboarding/email/verify — authenticated, 200

```json
{ "email": "engineer@example.com", "otp": "482910" }
```

Accepts exactly this account/generation/email challenge. Does not accept a public
registration `verificationToken`, `purpose` or frontend verification booleans.
Consumes the single-use OTP and persists email/emailVerified=true under a user row
lock. Unique constraints resolve concurrent ownership claims. If DB persistence
fails after OTP consumption, request a new code after cooldown.

```json
{
  "success": true,
  "email": "engineer@example.com",
  "emailVerified": true,
  "mustChangePassword": true,
  "onboardingComplete": false,
  "message": "Email verified. Replace your temporary password."
}
```

If password was already replaced, `onboardingComplete=true` and the onboarding
token is revoked; sign in again. 400 invalid/expired/consumed/wrong-account code
or exhausted attempts; 401 revoked session; 403 onboarding session required;
409 duplicate/already-verified email. Existing OTP TTL/attempt/CAS mechanics stay.

### POST /api/auth/change-password — authenticated, 200

```json
{ "newPassword": "PermanentPassword123!" }
```

Existing endpoint now accepts restricted onboarding context. No temporary password
must be resubmitted. Password must meet existing six-character minimum and differ
from the current password. Stores bcrypt, sets mustChangePassword=false, and
returns `message`, `mustChangePassword=false`, `onboardingComplete`.
Email verification and password replacement may happen in either order. One step
alone never unlocks internal business access. Transactions serialize with reissue.

### POST /api/users/{id}/revoke-temporary-credentials — ADMINISTRATOR only, 200

No body required. Explicit business action for incomplete internal users only.
Active internal users, customers and administrators return 409; unknown user 404;
invalid ID 400; missing/invalid authentication 401; non-admin 403.

Atomically rotates BOTH temporaryLogin and bcrypt password, generation, expiry and
access-token cutoff. Login is `onboarding-<id>-<random>@internal.local`. ID, stable
username, role, project assignments/history and all business data are preserved.
Partial email enrollment is cleared because it may belong to the compromised
credential generation. Employee must establish fresh inbox proof.

Old passwords/login/session versions/challenges are immediately unusable after
commit. Old Redis challenge records may remain until TTL but cannot authorize
anything. New identifier has a fresh attempt budget; old rate-limit records expire
naturally. Response is the provisioning fields above without createdAt. Plaintext
password is returned once; no retrieval endpoint exists. Audit records actor ID,
target User ID, action TEMPORARY_CREDENTIALS_REISSUED and timestamp only. Audit
failure rolls back rotation. Multiple/concurrent rotations leave only the final
generation usable. Completed accounts use verified-email/password reset instead.

## Permanent login, registration, OTP and recovery compatibility

```json
{ "email": "engineer@example.com", "password": "PermanentPassword123!" }
```

Completed login returns `accessToken` and safe user; temporaryLogin never works
again, even with the new password. `username` remains in profile responses but
is not accepted in the password-login request or used as a credential lookup.

Customer registration retains `{username,password,verificationToken}`. Username
must be the real email verified by the existing public EMAIL_VERIFICATION bridge;
new CUSTOMER gets email equal to normalized username and emailVerified=true.
Duplicate username/email still returns 409, including concurrent creation.

LOGIN OTP and forgot-password use `email`, require verified inbox and active
internal onboarding state, and retain generic asynchronous enumeration-safe
responses. Temporary identifiers/unknown/unverified/incomplete accounts receive
no mail. Existing reset OTP -> /otp/verify -> passwordResetToken -> reset-password
uses real email, dedicated signing secret, passwordVersion and conditional update.
Proof type/purpose/expiration and password-hash version binding remain enforced.

## Migration and rollback

Migration: `server/prisma/migrations/20261004120000_user_email_identity/migration.sql`.
Adds nullable unique email/temporaryLogin, emailVerified=false, temporary credential
expiry/generation/access-token cutoff, and credential-free provisioning audit table.
Database checks enforce normalized non-temporary real-email representation and
verified-email non-null ownership. All IDs and foreign-key relationships survive.

Before deployment, from server/ run:

```powershell
npm.cmd run prisma:identity-preflight
npx.cmd prisma migrate status
npx.cmd prisma migrate deploy
npx.cmd prisma generate
npm.cmd run build
```

Preflight is read-only and uses the application validator for historical CUSTOMER
usernames. It fails on invalid identities or normalized collisions, reporting IDs.
Resolve those identities explicitly before migration. SQL also fails atomically
on common invalid domains and unique collisions. The local application database
was migrated on 2026-10-04 after the 9-customer preflight passed. All five migrations
are applied; administrator login and authenticated identity returned HTTP 200.
Other environments must still follow the deployment sequence above.

- Customers: normalized email-style username becomes email; username, ID and
  password are preserved. emailVerified remains false because historical proof
  was not persisted. Password access remains compatible. Authenticate normally,
  then use authenticated email request/verify for that exact backfilled email
  before OTP login/recovery. Cannot replace it with a different email here.
- Internal users: no real email is fabricated. email=null, emailVerified=false,
  temporaryLogin=`legacy-<id>@internal.local`, 48-hour expiry, fresh generation and
  mustChangePassword=true. Existing hash/IDs/relationships remain. Administrator
  should reissue if the existing password is unavailable or exposed. Legacy normal
  tokens are revoked at migration cutoff.
- Administrators: actual email/password login, no internal onboarding gate. Legacy
  administrators with email=null require an explicit local-data update by User ID
  assigning their chosen real email; do not infer it from username or mark it verified.
  A normal authenticated admin can verify that email for OTP/recovery. New seeds
  have an explicit email field; existing seed rows are never silently overwritten.
- Development seed no longer overwrites existing password/onboarding state. New
  demo internal accounts have seed-prefixed expiring identifiers and require
  onboarding. Seeds are not evidence of verified inbox ownership. Seed was not run.

Manual rollback: `server/prisma/rollback/user-email-identity.sql`. Stop the new
backend and export email/provisioning metadata/audit first. Drops only new fields
and audit table; preserves IDs, hashes, usernames and project relationships. Old
backend requires username login. Verification evidence and revocation state are
lost on rollback; do not restore old backend security assumptions silently.
Coordinate migration history before reapplying; reviewed projects are unaffected.

## Exact Swagger sequence

1. Sign in as the administrator with actual `email` and `password`.
   Authorize with its accessToken; POST /users with the profile/role body above.
2. Copy the returned temporaryLogin/password to POST /auth/login as email/password.
   Confirm onboardingToken exists and accessToken is absent. Authorize with it.
3. GET /auth/me succeeds. GET /projects and POST /projects/{id}/review/start return
   403 even if this Engineer has an assignment.
4. POST /auth/onboarding/email/request with a real inbox. POST the exact email and
   inbox OTP to /auth/onboarding/email/verify. Wrong email/account/code fails.
5. POST /auth/change-password with a different permanent password. Confirm both
   requirements complete. The old onboardingToken now gets 401.
6. POST /auth/login with real email/new password. Authorize with accessToken.
   Assigned Engineer review succeeds using the existing SUBMITTED ->
   UNDER_ENGINEER_REVIEW -> ENGINEER_READY actions.
7. Verify old temporaryLogin fails even with the permanent password. Old temporary
   password fails. Active account revoke-temporary-credentials returns 409.
8. For revocation, provision another incomplete Engineer; retain its old credentials,
   onboardingToken and email OTP. Reauthorize as admin; POST
   /users/{id}/revoke-temporary-credentials. ID/username/role stay the same; new
   login/password/expiry are returned. Old login fails 401; old token fails 401;
   new session cannot use old OTP. New credentials return onboardingToken only.
9. Repeat revocation and check all earlier generations fail. Non-admin revoke
   returns 403. Set expiry in an isolated fixture to the past: login/token fail401;
   authorized reissue restores onboarding with a fresh expiration.
10. Complete the second account, then exercise LOGIN OTP and forgot-password using
    its verified real email. Requests using temporaryLogin return generic responses
    and produce no mail. Reset proof changes the password once; replay fails400.

## Tests and limits

### Files changed for this identity task

| Files (relative to repository) | Change |
|---|---|
| `server/prisma/schema.prisma` | User identity, generation/expiry/cutoff fields and provisioning audit relations/model |
| `server/prisma/migrations/20261004120000_user_email_identity/migration.sql` | Transactional backfill, unique constraints, checks and audit table |
| `server/prisma/rollback/user-email-identity.sql` | Manual rollback with data/audit export guidance |
| `server/prisma/seed.ts` | Safe new demo identity state; preserve existing chosen credentials |
| `server/scripts/check-identity-migration.ts` | Read-only validator/collision preflight |
| `server/src/users/users.service.ts`, `users.controller.ts` | Generated provisioning and atomic audited administrator revocation/reissue |
| `server/src/users/dto/create-internal-user.dto.ts`, `temporary-credentials-response.dto.ts` | Required profile-only inputs and documented one-time credential response |
| `server/src/auth/auth.service.ts`, `auth.controller.ts`, `auth.module.ts` | Real-email login/recovery/registration, onboarding-only login response and endpoint/module wiring |
| `server/src/auth/onboarding.service.ts` | Account-generation-bound email challenges and locked password/email activation |
| `server/src/auth/identity-policy.ts` | Shared real-email and internal activation rules |
| `server/src/auth/temporary-login-limiter.service.ts` | Redis-backed atomic temporary credential attempt window |
| `server/src/auth/guards/jwt-auth.guard.ts` | Central DB identity/state, generation, scope, lifetime and token-cutoff enforcement |
| `server/src/auth/dto/login.dto.ts`, `email-otp-request.dto.ts`, `identity-response.dto.ts`, `onboarding-email-verify.dto.ts` | Compatibility login, real email and Swagger lifecycle DTOs |
| `server/src/auth/password-reset/password-reset-token.service.ts` | Verified real-email lookup while retaining reset token binding |
| `server/src/common/decorators/allow-onboarding.decorator.ts`, `current-user.decorator.ts` | Minimal-route opt-in and trusted session metadata |
| `server/src/otp/otp.service.ts` | Server-only account/generation namespaces; prohibit temporary mail destinations |
| `server/src/infrastructure/config/configuration.ts`, `config.module.ts`, `server/.env.example` | Validated provisioning lifetime configuration, no secret changes |
| `server/src/infrastructure/swagger/setup-swagger.ts` | Explain onboarding/access bearer distinction |
| `server/src/projects/dto/project-review-response.dto.ts` | Clarify username is stable identity rather than authentication email |
| `server/test/identity-onboarding.test.ts` | 17 lifecycle/migration HTTP integration groups |
| `server/test/auth-otp.test.ts`, `redis-otp.test.ts`, `project-review.test.ts` | Real-email/active-account fixtures and real Redis limiter test |
| `server/package.json` | Provisioning test and identity preflight scripts |
| `server/test/otp-auth-flows.md`, `.claude/docs/ai/engineer-review/api-handoff.md`, this document | Updated integration prerequisites and complete Swagger lifecycle |
| `releases/server.md`, `releases/README.md` | Task audit and release index |

Existing Engineer Review code and unrelated S1-4 test files were preserved.

`npm.cmd run test:identity-onboarding` builds then runs isolated real-PostgreSQL HTTP
tests. Combined node runner covers 17 lifecycle/migration groups, 15 auth/OTP groups,
12 Engineer Review groups and two real-Redis groups. External mail is captured;
integration suites create/drop random temporary schemas and Redis keys. Live SMTP
delivery was not performed. Local application migrations were subsequently applied
to resolve administrator login; no seed/password reset was run. Baseline regular
Jest auth suites have unrelated ESM/.js import-loading failures.

OTP proves access to the submitted inbox, not the employee's real-world identity.
Since admin does not nominate an expected email, a thief possessing an unexpired
credential set can attempt onboarding with an inbox they control. Restricted access,
expiry and reissue reduce exposure; confirming the intended employee still requires
an organizational handoff or a separately agreed approval/identity process.

This is a backend contract change; frontend wiring remains untouched and must handle
the two token response variants and restricted onboarding before business navigation.
