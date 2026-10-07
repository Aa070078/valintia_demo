# Releases — Server

## [2026-10-07 18:15] Match welcome logo MIME type to actual image data

**ID:** 20261007-1815-welcome-logo-mime-type
**By:** @abdelrhman632
**App:** server
**Requested:** Fix the welcome logo still appearing broken in Gmail.
**Scope:** Welcome logo format helper, welcome service, preview generator, regression tests and email documentation.

### Summary
Found that the unchanged source `valentia-logo.png` contains JPEG/JFIF bytes, while the attachment and preview were labelled `image/png`. Corrected outgoing attachment MIME and filename based on the image signature without modifying the logo. The earlier browser preview and byte-equality checks did not catch this mismatch.

### Changes
- Detect JPEG/PNG signatures, use the matching MIME type and attachment extension, and reject unsupported image data.
- Make browser preview data URIs use the same detected format.
- Extend serialized-message regression checks to verify JPEG MIME, `.jpg` filename and exact source bytes.

### Verification
- Backend build and targeted lint passed; all 14 welcome tests passed without SMTP/network delivery.
- Regenerated local HTML preview with `image/jpeg`; backend health returned HTTP 200.
- Stopped the stale backend and started a fresh compiled instance at 18:20; confirmed port 5000 serves the corrected build.

### Notes
- Confirmed defect: JPEG data was advertised as PNG. Received Gmail rendering after correction still needs a new message test; old messages are immutable.
- Gmail screenshot also shows Spam. Gmail may withhold images from suspicious messages; this is separate from the confirmed MIME mismatch.
- No real email sent by the agent, no asset edits, no pushes or merges.


## [2026-10-07 17:58] Correct welcome logo Content-ID format

**ID:** 20261007-1758-welcome-logo-content-id
**By:** @abdelrhman632
**App:** server
**Requested:** Investigate a broken welcome email logo shown in the Tempail inbox.
**Scope:** Welcome service/template, welcome tests, email troubleshooting documentation.

### Summary
Verified that the actual outgoing message already includes an inline PNG MIME part. Replaced the bare reused Content-ID with a unique email-shaped identifier per message and the same reference in HTML, following Nodemailer embedded-image guidance. Added serialization checks to cover the transport boundary beyond the earlier adapter-only tests.

### Changes
- Generate a UUID-based Content-ID in an identifier namespace, with matching HTML `cid:` source; preserve original image bytes.
- Test actual multipart/related structure, inline image disposition, PNG bytes, folded Content-ID headers and per-message uniqueness using local stream transport.
- Document that raw browser HTML needs MIME resolution and old messages cannot update retroactively.

### Verification
- Backend build, targeted lint and all 13 welcome tests passed. Stream transport makes no network requests.
- Tempail public link responded, but its message iframe lacked the recipient session. Provider handling of the affected message could not be verified.

### Notes
- Confirmed: original PNG was attached; prior Content-ID lacked addr-spec syntax and uniqueness. Not confirmed: whether this caused the Tempail rendering failure.
- No real email sent by the agent; inbox rendering still needs a new user-triggered welcome test. No push or merge.


## [2026-10-07 17:52] Branded bilingual welcome email

**ID:** 20261007-1752-branded-welcome-email
**By:** @abdelrhman632
**App:** server
**Requested:** Add a branded Arabic-first welcome email after successful verified registration or staff onboarding; restart the system for manual email testing.
**Scope:** Auth registration/onboarding services and registration DTO, mail service/module/interfaces, welcome template/service, configuration, bundled logo, Nest asset packaging, preview script, tests and environment example.

### Summary
Welcome notification runs after the unique customer insert or the row-locked staff completion transaction commits. Existing uniqueness and persisted onboarding transitions prevent repeat requests from sending duplicate welcomes. SMTP failure is caught after commit, preserving successful account setup. The email contains Arabic RTL then English LTR copy, two configured login buttons, a safely escaped first name, the unchanged logo as an inline CID attachment, and bilingual plain text.

### Changes
- Added `welcome.service.ts`, `welcome.template.ts`, bundled unchanged logo bytes, and a self-contained HTML/plain-text preview generator.
- Added `WELCOME_EMAIL_ENABLED`, `WELCOME_FRONTEND_LOGIN_URL`, and optional `WELCOME_LOGO_PATH`; reject unresolved/development login URLs before production SMTP.
- Extended MailService with optional strict failure reporting for welcome mail; preserved legacy OTP delivery behavior. Made SMTP tests explicitly select production/development behavior.
- Added optional registration `firstName` for this notification only; no schema changes or new dependencies.
- Enabled welcome delivery in ignored local development configuration at the user's request and restarted backend/client/dashboard. No agent-generated real email tests.

### Verification
- Backend build passed. Combined welcome, SMTP and auth/OTP suites: 33 tests passed with fake external adapters.
- Client TypeScript and 9 auth browser checks passed; targeted server/client source lint passed.
- Inspected local HTML preview in Edge; mobile viewport did not overflow. Verified bundled PNG exactly matches the root asset.
- Restarted services: client signup, dashboard login and backend health returned HTTP 200.

### Notes
- Local branch `feat/branded-welcome-email`; no push or merge. Local HTML preview at `server/test/previews/welcome.html` is generated and ignored.
- Existing mail architecture is best effort with a single SMTP attempt; no durable queue/automatic resend. A crash between commit and delivery or a delivery failure may lose the welcome message. SMTP acceptance alone is not inbox delivery.
- Default delivery remains disabled; local enabling permits the user to test through signup or staff onboarding. Completed-account login sends no new welcome.


## [2026-10-05 00:22] Replace Resend delivery with Gmail SMTP

## [2026-10-05 01:16] Email-only password login and shared internal onboarding

**ID:** 20261005-0116-email-only-password-login
**By:** @abdelrhman632
**App:** server
**Requested:** Email/password-only login, generic internally provisioned persona onboarding, obsolete provider cleanup, and Swagger/regression validation without unrelated authentication redesign.
**Scope:** server/src/auth/dto/login.dto.ts, server/src/auth/auth.service.ts, server/src/auth/auth.controller.ts, server/src/auth/identity-policy.ts, server/src/users/dto/create-internal-user.dto.ts, server/src/users/users.service.ts, server/prisma/seed.ts, server/src/otp/otp.service.ts, server/src/otp/otp.controller.ts, server/test/auth-otp.test.ts, server/test/identity-onboarding.test.ts, server/test/mail-smtp.test.ts, server/test/otp-auth-flows.md, server/test/gmail-smtp-swagger.md, server/test/email-only-login-swagger.md, .claude/docs/ai/account-provisioning/api-handoff.md, server/.env (ignored/private; obsolete keys only), releases/server.md, releases/README.md

### Summary
Password login requires exactly email and password. Real email resolves only the email field; temporaryLogin resolves only incomplete internal accounts. Profile username remains unchanged and is never an authentication fallback, including administrator usernames.

### Changes
- Removed optional username alias, exactly-one validation and administrator username lookup; added real-email format rejection for permanent identifiers. Swagger declares only required email/password.
- Shared explicit INTERNAL_ROLES/isInternalRole policy covers ENGINEER, PROJECT_MANAGER and COMPANY_OWNER in provisioning DTO/service, reissue, onboarding classification and seed. Genuine business RBAC remains role-specific.
- New administrator/customer seed rows declare actual email explicitly. Upserts do not overwrite existing passwords, identities or onboarding; no schema migration or seed execution.
- Added HTTP/Swagger validation regressions and parameterized full lifecycle/OTP/profile/RBAC coverage for all three internal roles. Existing recovery/OTP/Redis/review tests preserved.
- Removed obsolete provider wording from active docs/comments/mock setup. Nodemailer runtime/dependencies and SMTP settings unchanged. Removed obsolete MAIL_PROVIDER, RESEND_API_KEY and MAIL_FROM from ignored private .env without displaying values; SMTP credentials preserved.
- Added exact Swagger regression/local administrator cleanup guide; corrected stale OTP identity documentation and provisioning handoff.

### Verification
- npm.cmd run build and application TypeScript check passed; focused TypeScript check for three edited test suites and seed passed.
- Combined node --import tsx --test runner passed 55/55: 15 auth/OTP, 21 onboarding/migration/role lifecycle, 5 SMTP, 12 Engineer Review, 2 real Redis. PostgreSQL suites used isolated random schemas; mail always mocked.
- Prettier check passed all 12 modified TypeScript files. ESLint passed six modified production files. Broader relevant lint reported existing require-await in requestAccountOtp, unsafe DTO transform returns, and project-service exclusion of seed/integration tests; no unrelated lint/config refactor.
- Repository-wide case-insensitive provider audit: only append-only historical release entries and generic resend/cooldown language remain; no active provider dependency/import/configuration. Authentication username lookup remains only in unchanged customer registration, not password login.
- git check-ignore confirms server/.env ignored; git ls-files confirms untracked. No credentials or OTPs logged. Live Gmail was previously manually proven by user; mocked tests do not establish live delivery.

### Notes
- Read-only local administrator audit: User 7 email=null requires explicit independently chosen email assignment by stable ID. User 67 already has a verified real email and must use that actual email rather than its email-shaped profile username. No application data modified.
- Existing historical customer/admin password-access policy is deliberately preserved; no fabricated verification or unrelated onboarding gate. Inbox verification remains required for their OTP/recovery.
- Append-only release history retains historical provider mentions as required by release-logging.mdc. SMTP startup/provider behavior unchanged.
- Stayed on feat/s2-engineer-review-workflow; no frontend edits, branch switch, merge, commit or push. GitHub CLI unavailable; author resolved from git config at log time.

**ID:** 20261005-0022-gmail-smtp-transport
**By:** @abdelrhman632
**App:** server
**Requested:** Replace underlying Resend mail delivery with Nodemailer SMTP without modifying OTP/onboarding/authentication/Redis/proof-token logic.
**Scope:** server/src/infrastructure/mail/mail.service.ts, server/src/infrastructure/config/configuration.ts, server/.env.example, server/package.json, server/package-lock.json, server/test/mail-smtp.test.ts, server/test/identity-onboarding.test.ts, server/test/otp-auth-flows.md, server/test/gmail-smtp-swagger.md, releases/server.md, releases/README.md

### Summary
MailService now delivers through SMTP with Nodemailer, preserving sendMail/sendOtpEmail/setProvider and the existing OTP subject/text/HTML. Only the six requested SMTP environment keys feed transport configuration; initialization rejects missing settings and invalid port/secure values.

### Changes
- Added nodemailer ^10.0.14 and development types ^8.0.2; removed unused resend ^6.31.0 and its unused dependency tree. Updated package/lock files without unrelated dependency upgrades.
- Replaced Resend and console providers inside MailService with SMTP; port 587 uses required STARTTLS, secure=true supports implicit TLS, and transport timeouts bound delivery hangs. OTP sender is SMTP_FROM; recipients are unchanged with no domain whitelist.
- Configuration reads SMTP_HOST/PORT/SECURE/USER/PASS/FROM through existing registerAs/ConfigService architecture. Removed runtime MAIL_PROVIDER/MAIL_FROM/RESEND_API_KEY and SMTP_PASSWORD use; .env.example has placeholders only.
- Delivery failures log only allowlisted error code/numeric SMTP response code and return generic 503. Credentials, OTP, subject/body and raw provider errors/transcripts are never logged by the transport.
- Added five isolated transport test groups and test:mail-smtp script. Existing business mocks already override MailService and need no changes. Corrected one timing-sensitive legacy-token test fixture to explicitly predate its cutoff; no authentication logic changed.
- Updated OTP transport documentation and added complete password-first onboarding Swagger sequence in server/test/gmail-smtp-swagger.md.

### Verification
- Backend build and application TypeScript check passed; focused test TypeScript check passed.
- Combined runner: 51/51 groups passed (5 SMTP, 15 auth/OTP, 17 onboarding/migrations, 12 Engineer Review, 2 real Redis). No automated Gmail connection or live mail.
- SMTP tests verify required settings, exact text/subject, Gmail/Outlook recipients, configured sender, STARTTLS/implicit TLS, safe failure diagnostics and generic exceptions.
- git check-ignore confirms server/.env ignored; git ls-files confirms untracked. Actual .env values never changed/exposed; key-presence check found only SMTP_FROM missing.
- Resend package/import/runtime configuration absent. Historical audit/docs and one old explanatory OTP comment still mention the provider; resend action/cooldown wording means send again, not provider usage.

### Notes
- Set SMTP_FROM privately and restart before manual delivery testing. Live Gmail SMTP credentials/delivery were not verified; Google app-password and authorized sender guidance is linked in manual steps.
- Gmail sender policy/quotas apply; no OTP, onboarding, JWT/proof, Redis, recipient, verification or frontend logic changed.
- npm installation required cache-write escalation; no npm audit fix or unrelated security upgrade performed.
- GitHub CLI previously unavailable; author resolved from git config. Stayed on feat/s2-engineer-review-workflow; no branch switch, commit, merge or push.

## [2026-10-04 23:46] Apply local migrations and restore administrator login

**ID:** 20261004-2346-restore-admin-login
**By:** @abdelrhman632
**App:** server
**Requested:** Fix login for the newly created admin1@test.com account.
**Scope:** Local PostgreSQL migrations, backend runtime, .claude/docs/ai/account-provisioning/api-handoff.md, releases/

### Summary
The account existed with the correct supplied password, but the application database lacked the pending review and identity columns and the API was not listening. Applied both existing migrations and started the backend; the exact username/password login now succeeds.

### Changes
- Ran the read-only identity preflight, then applied 20261002142000_add_engineer_review and 20261004120000_user_email_identity to the configured local database using prisma migrate deploy.
- Regenerated Prisma client, built the backend and started npm run start:dev on port 5000. Left the backend running.
- Updated the provisioning handoff to reflect applied local migrations. No existing password, role, ID or business relationship was reset; migration onboarding/backfill behavior is the documented contract.

### Verification
- Existing account bcrypt comparison matched the user-supplied password; no password hash or access token logged.
- Identity preflight passed for 9 customer identities; migrate status confirms all five migrations applied; generate/build passed.
- POST /api/auth/login with the exact requested username/password returned 200 and an access token for ADMINISTRATOR User 67.
- Authenticated GET /api/auth/me returned 200 with the same identity; /docs returned 200 and Swagger HTML.
- Browser verification skills inspected, but agent-browser CLI is unavailable; used HTTP verification and do not claim visual browser testing.

### Notes
- Database migration establishes the documented 48-hour onboarding credential period for legacy internal accounts.
- Actual .env secrets unchanged. GitHub CLI remains unavailable; author resolved from git config. No frontend changes, branch switch, merge, commit or push.

## [2026-10-04 23:26] Verified-email identity and restricted internal provisioning

**ID:** 20261004-2326-verified-email-internal-provisioning
**By:** @abdelrhman632
**App:** server
**Requested:** Separate stable username from real verified email; generate expiring temporary credentials; restrict onboarding; allow atomic administrator revocation/reissue while preserving Engineer Review and OTP/recovery.
**Scope:** server/src/auth/, users/, otp/otp.service.ts, common/decorators/, infrastructure/config/, infrastructure/swagger/, projects/dto/project-review-response.dto.ts, server/prisma/, server/scripts/, server/test/, server/package.json, server/.env.example, .claude/docs/ai/

### Summary
Provisioning now accepts only profile information and internal role, generates unique username/login and bcrypt-backed temporary credentials, and grants only a 15-minute onboardingToken. Verified-email OTP and password replacement activate the existing User. Normal access retains sub/role; centralized database state and generation/cutoff checks prevent restricted or revoked credentials from accessing business endpoints.

### Changes
- Added unique nullable email/temporaryLogin, verification state, credential expiry/generation, access-token cutoff and credential-free account provisioning audit table. Migration preserves all User IDs and relationships, backfills customer email without fabricating verification, and requires existing internal users to onboard.
- Added read-only customer identity preflight, transactional migration and manual rollback/export guidance. Development seed preserves existing credentials and does not fabricate inbox verification.
- Provisioning generates collision-safe credentials with database constraints and concurrent insert retries. Dedicated ConfigModule lifetime defaults to 48 hours, accepts 24–72 hours; .env.example contains only the new numeric setting.
- Added administrator-only POST /users/:id/revoke-temporary-credentials: atomically rotates login/password/generation/expiry, clears compromised partial enrollment, preserves business identity/data, and writes audit metadata. Active accounts are protected. Shared row locks serialize with activation; cutoffs remain monotonic.
- Added immutable onboarding token scope plus current DB state/generation/expiry checks centrally. Legacy normal JWTs predating provisioning/reissue remain revoked after activation. No credential/password hash is in token responses or audit.
- Added authenticated /auth/onboarding/email/request and /verify using existing EMAIL_VERIFICATION mechanics with account/generation namespaces. Existing change-password supports restricted context; both requirements must complete before normal verified-email login.
- Real-email login uses email or username compatibility input alias; existing administrator username login and historical customer password access survive. LOGIN OTP/recovery require verified real email and completed internal onboarding; generic responses, reset token secrets/passwordVersion/conditional updates and OTP consumption remain intact.
- Added Redis CAS-backed five-attempt/15-minute temporary-login budget including real-email aliases while onboarding. Fresh rotated identifier receives a new budget; old records expire naturally.
- Documented Swagger request/response variants, new DTOs, complete test sequence, migration rules and file inventory in account-provisioning handoff. Updated review/OTP handoffs. No frontend or new dependencies.

### Verification
- TypeScript application check and explicit tests/script typecheck passed; backend build and Prisma format/generate/validate passed.
- Combined integration run: 46/46 groups passed (17 identity/onboarding, 15 auth/OTP, 12 Engineer Review, 2 real Redis). Isolated PostgreSQL migrations, rollback/reapply, duplicates, parallel provisioning/revocation/verification and failed-audit rollback tested.
- Final test:identity-onboarding build/rerun after monotonic cutoff hardening: 17/17 passed. A misplaced hardening hunk was caught by build, corrected, then build/typecheck/tests passed.
- Read-only identity preflight against current target database passed for 9 customer identities; no data changed. Application migration and seed were not applied.
- Existing regular Jest: one suite passes; two auth suites retain baseline ESM/.js module-loading failures. Unrelated seeded S1-4 e2e files preserved and not executed against the ordinary database.
- Standards/spec review findings addressed (validator-based legacy preflight, persistent legacy-token cutoff and monotonic revocation). No remaining demonstrated security failures reported.

### Notes
- Historical customer verification evidence was not stored: migration intentionally leaves emailVerified=false. Password login remains available; verify exact backfilled email before email OTP/recovery.
- OTP proves submitted inbox control. Because administrator does not nominate an expected email, matching an onboarding account to the intended employee still relies on organizational handoff or a separately agreed identity-approval process.
- No comprehensive IP/global abuse limiter or durable mail queue added. Existing access sessions still survive ordinary password reset; provisioning/reissue cutoff is separate.
- Apply preflight/migration before starting this backend against the ordinary schema; frontend must handle onboardingToken separately. Backend B/frontend review contract coordination remains pending.
- Actual .env secrets untouched; no live Resend mail. GitHub CLI unavailable; author resolved from git config. Stayed on feat/s2-engineer-review-workflow; no branch switch, merge, commit or push.

## [2026-10-02 18:13] Engineer review and consultation readiness foundation

**ID:** 20261002-1813-engineer-review-foundation
**By:** @abdelrhman632
**App:** server
**Requested:** Phase 6 assigned-engineer review context, controlled transitions, consultation readiness, activity history, RBAC and Swagger.
**Scope:** server/src/projects/, server/prisma/, server/package.json, server/test/project-review.test.ts, .claude/docs/ai/engineer-review/api-handoff.md

### Summary
Added assigned-engineer review actions on Project: SUBMITTED -> UNDER_ENGINEER_REVIEW -> ENGINEER_READY. Each successful action writes customer-visible history in the same database transaction. Review context exposes all currently modeled project data without credentials.

### Changes
- Added ENGINEER-only review context, start-review and ready-for-consultation endpoints, plus authorized project activity history; documented request/response schemas and errors in Swagger.
- Added fixed business actions with optional notes; clients cannot supply status, actor or assignment. Service checks role, assignment and expected state.
- Added ProjectActivity with actor-role and status snapshots, two ProjectStatus values, forward migration and manual rollback guidance.
- Serialized review and engineer-assignment actions using a shared Project row lock. Reassignment is limited to DRAFT/SUBMITTED to preserve active review ownership.
- Added isolated PostgreSQL HTTP integration tests and test:project-review script. Published exact contract and pending coordination decisions in the API handoff.

### Verification
- Prisma format/generate/validate, TypeScript check and backend build passed.
- All 12 review integration test groups passed, including RBAC, payload validation, Swagger, concurrent transitions/reassignment, transaction rollback and migration rollback/reapplication.
- All 16 OTP/Redis regression test groups passed.
- Existing regular Jest auth suites still fail on baseline ESM/.js module loading; app-controller suite passes.
- Standards and specification reviews reported no actionable findings. git diff --check passed.

### Notes
- The application database was not migrated; tests used a temporary PostgreSQL schema and removed it afterward. Apply the forward migration before using these endpoints.
- Backend B submission endpoint and absent preference/reference/drawing/budget/timeline fields remain integration dependencies; this change does not invent those contracts.
- Backend B and frontend-owner acknowledgment is pending; contacts were requested. No UI wiring, consultation booking, Site Visit, payments, Design Packages or BOQ changes.
- Unrelated S1-4 test files appeared during work and were preserved. Their seeded application-database e2e suite was not run.
- GitHub CLI unavailable; author resolved from git config. Worked on feat/s2-engineer-review-workflow; no branch switch, commit or push.

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
