-- CreateEnum
CREATE TYPE "ProjectActivityAction" AS ENUM ('REVIEW_STARTED', 'CONSULTATION_READY');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ProjectStatus" ADD VALUE 'UNDER_ENGINEER_REVIEW';
ALTER TYPE "ProjectStatus" ADD VALUE 'ENGINEER_READY';

-- CreateTable
CREATE TABLE "project_activities" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "actorId" INTEGER NOT NULL,
    "actorRole" "Role" NOT NULL,
    "action" "ProjectActivityAction" NOT NULL,
    "fromStatus" "ProjectStatus" NOT NULL,
    "toStatus" "ProjectStatus" NOT NULL,
    "note" VARCHAR(2000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_activities_projectId_createdAt_id_idx" ON "project_activities"("projectId", "createdAt", "id");

-- CreateIndex
CREATE INDEX "project_activities_actorId_idx" ON "project_activities"("actorId");

-- AddForeignKey
ALTER TABLE "project_activities" ADD CONSTRAINT "project_activities_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_activities" ADD CONSTRAINT "project_activities_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
