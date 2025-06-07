-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "jsonContent" JSONB,
ALTER COLUMN "content" DROP NOT NULL;
