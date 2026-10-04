-- Manual rollback for the Phase 6 foundation only; NOT a Prisma forward migration.
-- Back up new activity history first. This drops review events and returns reviewed
-- projects to SUBMITTED; deploy the previous backend and coordinate migration history.
-- Never run against a schema with additional/later ProjectStatus values.
BEGIN;

DROP TABLE "project_activities";
DROP TYPE "ProjectActivityAction";

UPDATE "projects" SET "status" = 'SUBMITTED', "updatedAt" = CURRENT_TIMESTAMP
WHERE "status"::text IN ('UNDER_ENGINEER_REVIEW', 'ENGINEER_READY');

ALTER TABLE "projects" ALTER COLUMN "status" DROP DEFAULT;
ALTER TYPE "ProjectStatus" RENAME TO "ProjectStatus_review_rollback";
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'SUBMITTED');
ALTER TABLE "projects" ALTER COLUMN "status" TYPE "ProjectStatus"
USING "status"::text::"ProjectStatus";
ALTER TABLE "projects" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
DROP TYPE "ProjectStatus_review_rollback";

COMMIT;
