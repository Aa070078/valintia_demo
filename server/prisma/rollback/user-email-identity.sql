-- Manual rollback only, not a forward Prisma migration.
-- Stop the new backend and export users' email/temporaryLogin/emailVerified and
-- mustChangePassword before rollback. Verification evidence cannot be reconstructed.
-- Old backend logs in by username; provisioned users must receive that identifier.
-- Existing internal mustChangePassword=true is intentionally not relaxed.
-- IDs, password hashes, usernames and all project relationships are preserved.
-- Coordinate Prisma migration-history restoration before reapplying.
BEGIN;
-- Export account provisioning audit records before dropping this table.
DROP TABLE "account_provisioning_activities";
ALTER TABLE "users" DROP CONSTRAINT "users_real_email_check",
  DROP CONSTRAINT "users_verified_email_check";
DROP INDEX "users_email_key";
DROP INDEX "users_temporaryLogin_key";
ALTER TABLE "users" DROP COLUMN "email", DROP COLUMN "temporaryLogin", DROP COLUMN "emailVerified",
  DROP COLUMN "temporaryCredentialsExpiresAt", DROP COLUMN "onboardingVersion", DROP COLUMN "accessTokensValidAfter";
COMMIT;
