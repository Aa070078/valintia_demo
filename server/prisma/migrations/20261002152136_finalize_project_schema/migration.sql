/*
  Warnings:

  - You are about to alter the column `sizeBytes` on the `project_documents` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to drop the column `customDetails` on the `project_scopes` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `included` on the `spaces` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `spaces` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[projectId,engineerId]` on the table `project_assignments` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "project_assignments_projectId_key";

-- AlterTable
ALTER TABLE "project_documents" ALTER COLUMN "sizeBytes" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "project_scopes" DROP COLUMN "customDetails";

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "notes";

-- AlterTable
ALTER TABLE "space_style_preferences" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "spaces" DROP COLUMN "included",
DROP COLUMN "notes";

-- CreateIndex
CREATE INDEX "project_assignments_projectId_idx" ON "project_assignments"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "project_assignments_projectId_engineerId_key" ON "project_assignments"("projectId", "engineerId");
