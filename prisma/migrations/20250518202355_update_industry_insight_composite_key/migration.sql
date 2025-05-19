/*
  Warnings:

  - A unique constraint covering the columns `[industry,subIndustry]` on the table `IndustryInsight` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subIndustry` to the `IndustryInsight` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_industry_fkey";

-- DropIndex
DROP INDEX "IndustryInsight_industry_key";

-- AlterTable
ALTER TABLE "IndustryInsight" ADD COLUMN     "subIndustry" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "IndustryInsight_industry_subIndustry_key" ON "IndustryInsight"("industry", "subIndustry");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_industry_subIndustry_fkey" FOREIGN KEY ("industry", "subIndustry") REFERENCES "IndustryInsight"("industry", "subIndustry") ON DELETE SET NULL ON UPDATE CASCADE;
