/*
  Warnings:

  - The values [LIVING_ROOM,BALCONY] on the enum `SpaceType` will be removed. If these variants are still used in the database, this will fail.
  - Changed the type of `propertyType` on the `properties` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('VILLA', 'APARTMENT', 'DUPLEX', 'PENTHOUSE', 'COMMERCIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "PropertyCondition" AS ENUM ('RED_BRICK', 'SEMI_FINISHED', 'UNDER_CONSTRUCTION', 'OCCUPIED');

-- CreateEnum
CREATE TYPE "ScopeType" AS ENUM ('FULL_FITOUT', 'RENOVATION', 'INTERIOR_DESIGN', 'OTHER');

-- CreateEnum
CREATE TYPE "BudgetType" AS ENUM ('EXACT', 'RANGE', 'UNDECIDED');

-- CreateEnum
CREATE TYPE "DeadlineType" AS ENUM ('SPECIFIC_DATE', 'DURATION', 'NO_DEADLINE');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('ARCHITECTURAL', 'ENGINEERING', 'MEP', 'BOQ', 'OTHER');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('PROJECT_CREATED', 'PROJECT_SUBMITTED', 'ENGINEER_ASSIGNED');

-- AlterEnum
BEGIN;
CREATE TYPE "SpaceType_new" AS ENUM ('LIVING', 'DINING', 'KITCHEN', 'MASTER_BEDROOM', 'BEDROOM', 'BATHROOM', 'TERRACE', 'OFFICE', 'DRESSING', 'CUSTOM');
ALTER TABLE "spaces" ALTER COLUMN "type" TYPE "SpaceType_new" USING ("type"::text::"SpaceType_new");
ALTER TYPE "SpaceType" RENAME TO "SpaceType_old";
ALTER TYPE "SpaceType_new" RENAME TO "SpaceType";
DROP TYPE "public"."SpaceType_old";
COMMIT;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "primaryStyleId" TEXT;

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "accessibilityNotes" TEXT,
ADD COLUMN     "condition" "PropertyCondition",
ADD COLUMN     "floors" INTEGER,
ADD COLUMN     "governorate" TEXT,
DROP COLUMN "propertyType",
ADD COLUMN     "propertyType" "PropertyType" NOT NULL;

-- AlterTable
ALTER TABLE "spaces" ADD COLUMN     "customName" TEXT,
ADD COLUMN     "included" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "referenceImages" TEXT[],
ADD COLUMN     "styleId" TEXT,
ADD COLUMN     "styleName" TEXT,
ADD COLUMN     "styleNotes" TEXT;

-- CreateTable
CREATE TABLE "customer_locations" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "country" TEXT NOT NULL,
    "countryCode" TEXT,
    "city" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "phone" TEXT,
    "phoneCountryCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_representatives" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "hasRepresentative" BOOLEAN NOT NULL DEFAULT false,
    "valentiaManagedDirectly" BOOLEAN NOT NULL DEFAULT true,
    "name" TEXT,
    "phone" TEXT,
    "phoneCountryCode" TEXT,
    "email" TEXT,
    "relationship" TEXT,
    "authorizationScope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_representatives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_scopes" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "scopeType" "ScopeType" NOT NULL,
    "customDetails" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_scopes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_budgets" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "budgetType" "BudgetType" NOT NULL,
    "exactAmount" DECIMAL(12,2),
    "minAmount" DECIMAL(12,2),
    "maxAmount" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "target_completions" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "deadlineType" "DeadlineType" NOT NULL,
    "targetDate" TIMESTAMP(3),
    "durationDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "target_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_documents" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "category" "DocumentCategory" NOT NULL,
    "url" TEXT NOT NULL,
    "sizeBytes" BIGINT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_activities" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "actorId" INTEGER NOT NULL,
    "type" "ActivityType" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_locations_projectId_key" ON "customer_locations"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "project_representatives_projectId_key" ON "project_representatives"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "project_scopes_projectId_key" ON "project_scopes"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "project_budgets_projectId_key" ON "project_budgets"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "target_completions_projectId_key" ON "target_completions"("projectId");

-- CreateIndex
CREATE INDEX "project_documents_projectId_idx" ON "project_documents"("projectId");

-- CreateIndex
CREATE INDEX "project_activities_projectId_idx" ON "project_activities"("projectId");

-- CreateIndex
CREATE INDEX "project_activities_actorId_idx" ON "project_activities"("actorId");

-- AddForeignKey
ALTER TABLE "customer_locations" ADD CONSTRAINT "customer_locations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_representatives" ADD CONSTRAINT "project_representatives_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_scopes" ADD CONSTRAINT "project_scopes_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_budgets" ADD CONSTRAINT "project_budgets_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "target_completions" ADD CONSTRAINT "target_completions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_activities" ADD CONSTRAINT "project_activities_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_activities" ADD CONSTRAINT "project_activities_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
