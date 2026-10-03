/*
  Warnings:

  - You are about to drop the column `primaryStyleId` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `spaces` table. All the data in the column will be lost.
  - You are about to drop the column `referenceImages` on the `spaces` table. All the data in the column will be lost.
  - You are about to drop the column `styleId` on the `spaces` table. All the data in the column will be lost.
  - You are about to drop the column `styleName` on the `spaces` table. All the data in the column will be lost.
  - You are about to drop the column `styleNotes` on the `spaces` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "StylePreferenceMode" AS ENUM ('WHOLE_PROJECT', 'PER_SPACE', 'ENGINEER_DECIDES');

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "primaryStyleId";

-- AlterTable
ALTER TABLE "spaces" DROP COLUMN "quantity",
DROP COLUMN "referenceImages",
DROP COLUMN "styleId",
DROP COLUMN "styleName",
DROP COLUMN "styleNotes";

-- CreateTable
CREATE TABLE "project_style_preferences" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "mode" "StylePreferenceMode" NOT NULL,
    "styleId" TEXT,
    "styleName" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_style_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "space_style_preferences" (
    "id" SERIAL NOT NULL,
    "projectStylePreferenceId" INTEGER NOT NULL,
    "spaceId" INTEGER NOT NULL,
    "styleId" TEXT NOT NULL,
    "styleName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "space_style_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_style_preferences_projectId_key" ON "project_style_preferences"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "space_style_preferences_spaceId_key" ON "space_style_preferences"("spaceId");

-- CreateIndex
CREATE INDEX "space_style_preferences_projectStylePreferenceId_idx" ON "space_style_preferences"("projectStylePreferenceId");

-- AddForeignKey
ALTER TABLE "project_style_preferences" ADD CONSTRAINT "project_style_preferences_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_style_preferences" ADD CONSTRAINT "space_style_preferences_projectStylePreferenceId_fkey" FOREIGN KEY ("projectStylePreferenceId") REFERENCES "project_style_preferences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_style_preferences" ADD CONSTRAINT "space_style_preferences_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
