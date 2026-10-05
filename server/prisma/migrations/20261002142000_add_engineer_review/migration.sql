
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.

-- CreateEnum
CREATE TYPE "ProjectActivityAction" AS ENUM (
    'PROJECT_CREATED',
    'PROJECT_SUBMITTED',
    'ENGINEER_ASSIGNED',
    'ENGINEER_REASSIGNED',
    'REVIEW_STARTED',
    'CONSULTATION_READY'
);

-- AlterEnum
ALTER TYPE "ProjectStatus" ADD VALUE 'UNDER_ENGINEER_REVIEW';
ALTER TYPE "ProjectStatus" ADD VALUE 'ENGINEER_READY';

-- The project_activities table was already created by
-- 20260930022618_expand_project_domain.
-- Upgrade that existing table to the current schema.

ALTER TABLE "project_activities"
ADD COLUMN "actorRole" "Role",
ADD COLUMN "action" "ProjectActivityAction",
ADD COLUMN "fromStatus" "ProjectStatus",
ADD COLUMN "toStatus" "ProjectStatus",
ADD COLUMN "note" VARCHAR(2000);

-- Convert existing activity types to the new action field.
UPDATE "project_activities"
SET "action" = CASE "type"::text
    WHEN 'PROJECT_CREATED' THEN 'PROJECT_CREATED'::"ProjectActivityAction"
    WHEN 'PROJECT_SUBMITTED' THEN 'PROJECT_SUBMITTED'::"ProjectActivityAction"
    WHEN 'ENGINEER_ASSIGNED' THEN 'ENGINEER_ASSIGNED'::"ProjectActivityAction"
END;

-- Get the actor role from users.
UPDATE "project_activities" pa
SET "actorRole" = u."role"
FROM "users" u
WHERE pa."actorId" = u."id";

-- Existing activities are historical.
-- Their previous status is unknown, so fromStatus remains nullable.
UPDATE "project_activities"
SET "toStatus" = CASE "action"
    WHEN 'PROJECT_CREATED' THEN 'DRAFT'::"ProjectStatus"
    WHEN 'PROJECT_SUBMITTED' THEN 'SUBMITTED'::"ProjectStatus"
    WHEN 'ENGINEER_ASSIGNED' THEN 'SUBMITTED'::"ProjectStatus"
END;

ALTER TABLE "project_activities"
DROP COLUMN "type";

ALTER TABLE "project_activities"
ALTER COLUMN "actorRole" SET NOT NULL,
ALTER COLUMN "action" SET NOT NULL,
ALTER COLUMN "toStatus" SET NOT NULL;

DROP TYPE "ActivityType";

DROP INDEX "project_activities_projectId_idx";

CREATE INDEX "project_activities_projectId_createdAt_id_idx"
ON "project_activities"("projectId", "createdAt", "id");
