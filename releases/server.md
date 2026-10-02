# Releases — Server

## [2026-10-02 17:01] Complete OTP password reset and login

**ID:** 20261002-1701-complete-otp-auth-purposes
**By:** @abdelrhman632
**App:** server
**Requested:** Complete PASSWORD_RESET and LOGIN OTP flows locally on feat/s2-email-otp, preserve EMAIL_VERIFICATION, and remove unused GENERAL.
**Scope:** server/src/auth/, server/src/otp/, server/src/infrastructure/config/, server/src/infrastructure/redis/redis.service.ts, server/.env.example, server/package.json, server/test/

### Summary
Added complete forgot/reset-password and OTP-login endpoints using existing challenges, bcrypt, and JWT infrastructure. Reset proof has a dedicated secret and binds to user ID, normalized email and current password version; conditional password updates prevent replay. Password and OTP login share the original access-JWT format. Registration proof semantics remain intact.

### Changes
- Added email-request, LOGIN verification and reset-password DTOs; auth controller/service/module expose four new endpoints with validation and Swagger documentation.
- Added PasswordResetTokenModule/Service and registerAs passwordResetToken configuration; .env.example has placeholder-only PASSWORD_RESET_TOKEN_SECRET and PASSWORD_RESET_TOKEN_EXPIRES_IN=15m. No actual local secrets changed.
- Added OtpProofService to orchestrate registration/reset proof issuance; OtpService remains challenge mechanics. Dedicated account-bound request endpoints return generic responses independent of account lookup and provider latency, with handled in-process delivery.
- Added RedisService.compareAndSwapJSON for atomic TTL-preserving challenge updates and single consumption under concurrent requests, and setIfAbsent for atomic cooldown reservation. Preserved existing fifth-failure/sixth-request attempt-limit behavior; recommendation documented before changes.
- Removed GENERAL from enum and DTO messages after confirming only declarations/comments/messages referenced it. No frontend changes or new dependencies.
- Added server/test/auth-otp.test.ts, server/test/redis-otp.test.ts and server/test/otp-auth-flows.md; added test:auth-otp/test:redis-otp scripts and repaired the existing missing-file test:email-verification target.

### Verification
- npx.cmd tsc --noEmit: passed after reset, login and final source changes.
- Backend build: passed.
- Reset phase: seven HTTP test groups passed; LOGIN phase: ten passed; final HTTP suite: fifteen passed.
- Real Redis compare-and-swap integration check passed for TTL, stale updates and parallel consumption.
- Baseline Jest suite has pre-existing auth ESM/.js module-loading failures; its app-controller suite passes. Existing test:e2e configuration is missing.
- Standards and spec review findings (controller orchestration and account-request timing) addressed; follow-up reviews reported no remaining actionable findings.

### Notes
- Existing stateless access JWTs cannot be revoked by password reset and remain valid until expiry.
- Background mail delivery is best effort within the Nest process; no durable queue or comprehensive IP abuse-control layer was introduced.
- EMAIL_VERIFICATION proof reuse until expiry is preserved; reset proofs are invalidated by a password change.
- Live Resend and PostgreSQL end-to-end operations were not tested. Swagger sequences and limitations are documented in server/test/otp-auth-flows.md.
- GitHub CLI unavailable; author resolved from git config user.name. No branch switch, commit, push or merge.

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
