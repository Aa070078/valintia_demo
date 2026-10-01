# Email verification bridge: Swagger checks

Configure `server/.env` with a random `EMAIL_VERIFICATION_TOKEN_SECRET` distinct
from the access JWT secret, and `EMAIL_VERIFICATION_TOKEN_EXPIRES_IN=15m`.
Restart the backend with Redis, PostgreSQL, and the existing mail configuration.
Open `http://localhost:5000/docs` (adjust for your configured port).
Choose an email inbox you control with no existing account. The examples below
use `customer@example.com`; replace it consistently, including in the fixture script.

## a. Correct OTP returns a token

1. Expand `POST /api/otp/send`, select **Try it out**, and execute:
   ```json
   { "email": "customer@example.com", "purpose": "EMAIL_VERIFICATION" }
   ```
   Expect HTTP 200. Retrieve the six-digit OTP from the inbox.
2. Expand `POST /api/otp/verify` and execute with the actual OTP:
   ```json
   { "email": "customer@example.com", "otp": "123456", "purpose": "EMAIL_VERIFICATION" }
   ```
   Expect HTTP 200, `success: true`, `verified: true`, and `verificationToken`.
   Copy the full token. Repeating the verification request must return HTTP 400
   because the OTP was deleted.

## Registration requests

Use **Try it out** on `POST /api/auth/register`. Send the token in the JSON body,
not in Swagger's bearer-token **Authorize** dialog:

```json
{
  "username": "customer@example.com",
  "password": "Password123!",
  "verificationToken": "PASTE_FULL_TOKEN_HERE"
}
```

Run the rejection checks before the successful registration, or obtain new OTPs
for fresh email addresses. A valid token for an already registered email returns 409.

| Case | Exact variation | Expected |
| --- | --- | --- |
| b. Valid token, same email | Use the token from step a and its email as `username`. | 201; normalized username, CUSTOMER role, no password hash in response |
| c. Missing token | Remove the `verificationToken` field entirely. | 400 validation error |
| d. Tampered token | Split the token at its two dots; replace the first character of the final signature segment with `A` (or `B` if it is already `A`), preserving the rest. | 400 invalid or expired email verification token |
| e. Expired token | Use the `expired` fixture below; alternatively wait until the real token's `exp` has passed (15 minutes after issuance by default). | 400 invalid or expired email verification token |
| f. Email mismatch | Keep the valid token for `customer@example.com`, set `username` to `other@example.com`. | 400 invalid or expired email verification token |
| g. Wrong type / purpose | Submit `wrongType`, then `wrongPurpose` fixtures below, using the matching email. | 400 for each |

Supplying `emailVerified: true` or `verified: true` is rejected by the existing
global whitelist validation and never substitutes for a token. Other OTP purposes
return their existing success response without a registration token.

## Local signed negative-test fixtures

Wrong claims cannot be produced through the public OTP endpoint. Editing a decoded
JWT without re-signing only tests signature tampering. For isolated development
testing, run this PowerShell command from `server/` to create correctly signed
expired, wrong-type, and wrong-purpose tokens using your local configured secret:

```powershell
@'
import 'dotenv/config';
import { JwtService } from '@nestjs/jwt';
const secret = process.env.EMAIL_VERIFICATION_TOKEN_SECRET;
if (!secret?.trim()) throw new Error('Configure EMAIL_VERIFICATION_TOKEN_SECRET first');
const jwt = new JwtService({ secret });
const claims = {
  email: 'customer@example.com',
  purpose: 'EMAIL_VERIFICATION',
  type: 'email_verification',
};
for (const [label, payload, expiresIn] of [
  ['expired', claims, -1],
  ['wrongType', { ...claims, type: 'access' }, '15m'],
  ['wrongPurpose', { ...claims, purpose: 'PASSWORD_RESET' }, '15m'],
]) {
  console.log(`${label}: ${await jwt.signAsync(payload, { algorithm: 'HS256', expiresIn })}`);
}
'@ | node --input-type=module
```

The script prints test tokens, never the secret. It is a local test utility;
there is no backend endpoint for minting arbitrary claims.

## Automated check

From `server/`, run `npm.cmd run test:email-verification` on Windows, or
`npm run test:email-verification` elsewhere. It builds the backend before testing
the compiled controllers and DTO metadata over in-process HTTP. Redis, mail, and
database dependencies are isolated; JWT signing and verification are real.
