# Gmail SMTP onboarding manual test

Only email delivery changed. OTP/Redis, onboarding state, proof tokens and login
remain unchanged. Automated tests mock the transport and never contact Gmail.

## Private local configuration

Set these in the Git-ignored `server/.env`, never in shared requests or screenshots:

```dotenv
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<your Gmail account>
SMTP_PASS=<your Google app password>
SMTP_FROM="Valentia <your Gmail account>"
```

Use a Google app password with 2-Step Verification enabled when available for
your account: https://support.google.com/accounts/answer/185833.
Use the authenticated Gmail sender or an authorized Gmail sending alias for
SMTP_FROM; Gmail can rewrite unauthorized sender addresses:
https://nodemailer.com/usage/using-gmail.
Port 587 uses STARTTLS; secure=false does not disable TLS. Nodemailer is configured
to require the STARTTLS upgrade. No SMTP connection is made just to validate startup
settings. Missing/invalid configuration fails mail-service initialization by key name.

Restart from server/ with `npm.cmd run start:dev`, then open
http://localhost:5000/docs. Confirm the backend starts before sending requests.
Only the six SMTP settings above configure the mail transport.

## Exact Swagger sequence: password already changed

1. **Provision/get an incomplete internal account.** Login as administrator using
   POST /api/auth/login. Authorize with administrator accessToken, then POST /api/users:

   ```json
   { "firstName": "Smtp", "lastName": "Test", "birthYear": 1998, "role": "ENGINEER" }
   ```

   Copy returned temporaryLogin and temporaryPassword privately. For an existing
   incomplete account whose credentials expired, administrator can use POST
   /api/users/{id}/revoke-temporary-credentials. It changes that credential generation;
   use only the newly returned pair. A completed account is not eligible.

2. **Temporary login:** POST /api/auth/login:

   ```json
   { "email": "<returned temporaryLogin>", "password": "<returned temporaryPassword>" }
   ```

   Expect 200, onboardingToken and no accessToken. Authorize with onboardingToken
   (replace administrator token). GET /api/auth/me should show emailVerified=false.
   If reusing an account whose password has already been replaced, authenticate
   with its temporaryLogin and the new current password; the old temporary password
   is no longer valid. Do not reissue it merely to resume email verification.

3. **Replace the temporary password first**, unless already done for this credential
   generation. POST /api/auth/change-password:

   ```json
   { "newPassword": "MyNewPermanentPassword123!" }
   ```

   Expect 200, mustChangePassword=false and onboardingComplete=false while email is
   unverified. Keep the onboardingToken for the email steps; do not reset credentials.
   GET /api/auth/me should show emailVerified=false, mustChangePassword=false.

4. **Request email OTP:** POST /api/auth/onboarding/email/request:

   ```json
   { "email": "<real unused inbox you control>" }
   ```

   Use Gmail or Outlook (any valid real recipient domain is passed to SMTP).
   Expect 200 with delivery/expiry metadata. No OTP is returned in the API response.
   Check inbox/spam for the existing Valentia subject/body sent using SMTP_FROM.
   Only the real submitted recipient receives it; temporaryLogin is never a destination.
   Request another code using the same endpoint after the returned cooldown period.

5. **Verify that exact email:** POST /api/auth/onboarding/email/verify:

   ```json
   { "email": "<same real unused inbox>", "otp": "<six-digit code from inbox>" }
   ```

   Expect 200 with emailVerified=true, mustChangePassword=false and
   onboardingComplete=true. Because the password was already replaced, this completes
   onboarding immediately. The old onboardingToken is revoked; GET /auth/me with
   that token now returns 401. Do not use the public /otp/verify for this account-bound code.

6. **Permanent login:** POST /api/auth/login:

   ```json
   { "email": "<verified real inbox>", "password": "MyNewPermanentPassword123!" }
   ```

   Expect 200 with a normal accessToken and no onboardingToken. Authorize with it.
   GET /api/auth/me must show the same User ID and role, verified email,
   emailVerified=true, mustChangePassword=false, onboardingRequired=false.

## Failures and safe diagnosis

- Missing SMTP variables: startup error names the required setting without its value.
- Delivery failure: onboarding request gets generic 503; no SMTP response, credential,
  SMTP username/password or OTP is included in the error. Check safe server diagnostics
  such as EAUTH/535, ECONNECTION or ETIMEDOUT. Raw provider text/SMTP transcripts and
  message subjects/bodies are not logged by the transport.
- Existing asynchronous LOGIN/forgot-password requests retain generic responses even
  if mail fails; their existing business behavior was not changed.
- After failed delivery, existing Redis cooldown still applies. Wait, correct private
  configuration/restart if necessary, then resend. OTP validity/consumption is unchanged.
- 409: email already belongs to an account or is already verified; choose the intended
  unused real inbox. 429: existing resend cooldown or temporary-login budget.
- Gmail sender policies, quotas and spam handling remain provider constraints; no
  recipient whitelist exists in this implementation.

## Automated checks

From server/:

```powershell
npm.cmd run test:mail-smtp
node --import tsx --test test/mail-smtp.test.ts test/auth-otp.test.ts test/identity-onboarding.test.ts test/project-review.test.ts test/redis-otp.test.ts
npx.cmd tsc --noEmit
npm.cmd run build
```

Existing business suites override MailService; focused transport tests intercept
Nodemailer createTransport/sendMail and use only fake SMTP settings. Real Redis
tests use temporary keys; PostgreSQL suites use temporary schemas.
