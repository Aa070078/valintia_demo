-- Run npm run prisma:identity-preflight against the target database before deploy.
BEGIN;
ALTER TABLE "users" ADD COLUMN "email" TEXT,
  ADD COLUMN "temporaryLogin" TEXT,
  ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "temporaryCredentialsExpiresAt" TIMESTAMP(3),
  ADD COLUMN "onboardingVersion" TEXT,
  ADD COLUMN "accessTokensValidAfter" TIMESTAMP(3);

-- Historical customer usernames are email identities, but verification was not
-- recorded. Preserve password login without manufacturing verification evidence.
-- Stop atomically on invalid legacy identities or normalized duplicates.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM "users" WHERE "role" = 'CUSTOMER'
    AND (trim("username") !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
      OR lower(trim("username")) ~ '@(.*\.)?internal\.local$'
      OR split_part(trim("username"), '@', 2) ~ '(^-|-$|\.\.|\.-|-\.)')) THEN
    RAISE EXCEPTION 'Resolve invalid legacy CUSTOMER email identities before migrating';
  END IF;
END $$;
UPDATE "users" SET "email" = lower(trim("username")) WHERE "role" = 'CUSTOMER';
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
UPDATE "users" SET "temporaryLogin" = 'legacy-' || "id"::text || '@internal.local',
  "mustChangePassword" = true,
  "temporaryCredentialsExpiresAt" = CURRENT_TIMESTAMP + INTERVAL '48 hours',
  "onboardingVersion" = gen_random_uuid()::text,
  "accessTokensValidAfter" = CURRENT_TIMESTAMP
  WHERE "role" IN ('ENGINEER', 'PROJECT_MANAGER', 'COMPANY_OWNER');
CREATE UNIQUE INDEX "users_temporaryLogin_key" ON "users"("temporaryLogin");
ALTER TABLE "users" ADD CONSTRAINT "users_real_email_check" CHECK (
  "email" IS NULL OR ("email" = lower(trim("email")) AND "email" !~ '@(.*\.)?internal\.local$'));
ALTER TABLE "users" ADD CONSTRAINT "users_verified_email_check" CHECK (
  NOT "emailVerified" OR "email" IS NOT NULL);
CREATE TABLE "account_provisioning_activities" (
  "id" SERIAL PRIMARY KEY,
  "actorId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "action" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "account_provisioning_activities_userId_createdAt_idx" ON "account_provisioning_activities"("userId", "createdAt");
CREATE INDEX "account_provisioning_activities_actorId_idx" ON "account_provisioning_activities"("actorId");
COMMIT;
