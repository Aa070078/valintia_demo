# Releases — Server

## [2026-10-01 21:08] Email verification token bridge

**ID:** 20261001-2108-email-verification-token-bridge
**By:** @abdelrhman632
**App:** server
**Requested:** Issue a short-lived verification token after EMAIL_VERIFICATION OTP success and require it for CUSTOMER self-registration.
**Scope:** server/src/auth/, server/src/otp/, server/src/infrastructure/config/, server/.env.example, server/package.json, server/test/

### Summary
Successful email-verification OTP checks now return a dedicated signed token with normalized email, purpose, type, and a default 15-minute expiration. Existing registration requires that token and validates it before database access. Login JWT behavior, bcrypt hashing, CUSTOMER role, OTP deletion, Redis, and mail delivery remain intact.

### Changes
- Added isolated EmailVerificationModule and EmailVerificationService in server/src/auth/email-verification/ with HS256 signing/verification and expiration/claim validation.
- Extended server/src/auth/dto/register.dto.ts with mandatory verificationToken; wired server/src/auth/auth.module.ts and auth.service.ts to verify the token and normalize the registration username.
- Wired server/src/otp/otp.module.ts and otp.service.ts to issue tokens only for EMAIL_VERIFICATION; updated auth.controller.ts and otp.controller.ts Swagger documentation.
- Added registerAs configuration in server/src/infrastructure/config/configuration.ts and config.module.ts; added placeholder-only dedicated secret and 15m expiry in server/.env.example.
- Added server/test/email-verification.test.ts, server/test/email-verification-swagger.md, and the test:email-verification script in server/package.json. No dependencies added.
- Updated releases/server.md and releases/README.md for this audit.

### Verification
- npx.cmd tsc --noEmit: passed.
- npm.cmd run build: passed.
- node --import tsx --test test/email-verification.test.ts: all five HTTP test groups passed with real JWTs and isolated database/Redis/mail dependencies.
- npm.cmd test -- --runInBand: one suite passed, two auth suites failed with baseline Jest ESM/.js module-loading errors reproduced before changes.
- npm.cmd run test:e2e: existing script cannot find test/jest-e2e.json.
- Standards and spec reviews found no remaining implementation issues; audit and reproducible test instructions were added.

### Notes
- Set a random EMAIL_VERIFICATION_TOKEN_SECRET distinct from the access JWT secret before starting the backend; missing/reused secrets fail startup. Actual .env values were neither changed nor logged.
- Token is a short-lived bearer proof and is not separately consumed; existing duplicate-user checks prevent normal repeated registration. Existing OTP consumption remains unchanged.
- Swagger test sequence and locally signed negative-case fixtures are documented in server/test/email-verification-swagger.md. Live Redis/Resend/database end-to-end checks were not run.
- GitHub CLI was unavailable; author resolved from git config user.name. No frontend changes, commits, or pushes.

Append-only audit log for changes under `server/`. Newest entry at the top.
