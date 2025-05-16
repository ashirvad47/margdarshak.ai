-- AlterTable
ALTER TABLE "User" ADD COLUMN     "analyticalSkills" INTEGER,
ADD COLUMN     "codingSkills" INTEGER,
ADD COLUMN     "communicationSkills" INTEGER,
ADD COLUMN     "extracurricularActivities" INTEGER,
ADD COLUMN     "fieldOfStudy" TEXT,
ADD COLUMN     "fieldSpecificCourses" INTEGER,
ADD COLUMN     "gpa" DOUBLE PRECISION,
ADD COLUMN     "industryCertifications" INTEGER,
ADD COLUMN     "internships" INTEGER,
ADD COLUMN     "leadershipPositions" INTEGER,
ADD COLUMN     "networkingSkills" INTEGER,
ADD COLUMN     "presentationSkills" INTEGER,
ADD COLUMN     "problemSolvingSkills" INTEGER,
ADD COLUMN     "projects" INTEGER,
ADD COLUMN     "researchExperience" INTEGER,
ADD COLUMN     "teamworkSkills" INTEGER;

-- CreateIndex
CREATE INDEX "User_clerkUserId_idx" ON "User"("clerkUserId");
