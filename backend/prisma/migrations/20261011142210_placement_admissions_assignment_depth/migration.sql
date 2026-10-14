-- CreateEnum
CREATE TYPE "PlacementSource" AS ENUM ('TEST', 'MANUAL');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('NEW', 'REVIEWING', 'ACCEPTED', 'WAITLISTED', 'REJECTED', 'ENROLLED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "ApplicationSource" AS ENUM ('WEBSITE', 'CATALOG', 'PORTAL', 'WALK_IN');

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "gracePeriodMinutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "latePenaltyMaxPercent" DECIMAL(5,2) NOT NULL DEFAULT 100,
ADD COLUMN     "latePenaltyPercentPerDay" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "lessonId" TEXT;

-- AlterTable
ALTER TABLE "AssignmentSubmission" ADD COLUMN     "feedbackAudioFileId" TEXT,
ADD COLUMN     "latePenaltyPercent" DECIMAL(5,2),
ADD COLUMN     "rawScore" DECIMAL(6,2);

-- AlterTable
ALTER TABLE "AssignmentVersion" ADD COLUMN     "feedbackAudioFileId" TEXT,
ADD COLUMN     "lateByMinutes" INTEGER,
ADD COLUMN     "latePenaltyPercent" DECIMAL(5,2),
ADD COLUMN     "rawScore" DECIMAL(6,2);

-- AlterTable
ALTER TABLE "ClassGroup" ADD COLUMN     "attendanceAlertThreshold" INTEGER;

-- AlterTable
ALTER TABLE "ClassSession" ADD COLUMN     "cancelReason" TEXT;

-- AlterTable
ALTER TABLE "Level" ADD COLUMN     "attendanceAlertThreshold" INTEGER,
ADD COLUMN     "placementMinScore" INTEGER;

-- AlterTable
ALTER TABLE "_IntakeLevels" ADD CONSTRAINT "_IntakeLevels_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_IntakeLevels_AB_unique";

-- CreateTable
CREATE TABLE "AssignmentExtension" (
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "grantedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssignmentExtension_pkey" PRIMARY KEY ("assignmentId","studentId")
);

-- CreateTable
CREATE TABLE "FeedbackComment" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "category" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedbackComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RubricTemplate" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "criteria" JSONB NOT NULL DEFAULT '[]',
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RubricTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlacementResult" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "source" "PlacementSource" NOT NULL,
    "attemptId" TEXT,
    "score" INTEGER NOT NULL,
    "recommendedLevelId" TEXT NOT NULL,
    "chosenLevelId" TEXT,
    "assignedLevelId" TEXT,
    "overrideReason" TEXT,
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlacementResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "campusId" TEXT,
    "levelId" TEXT,
    "intakeId" TEXT,
    "shift" "Shift",
    "experience" TEXT,
    "message" TEXT,
    "source" "ApplicationSource" NOT NULL DEFAULT 'WEBSITE',
    "status" "ApplicationStatus" NOT NULL DEFAULT 'NEW',
    "rawPayload" JSONB,
    "decisionReason" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "waitlistedAt" TIMESTAMP(3),
    "studentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssignmentExtension_studentId_idx" ON "AssignmentExtension"("studentId");

-- CreateIndex
CREATE INDEX "FeedbackComment_ownerId_category_idx" ON "FeedbackComment"("ownerId", "category");

-- CreateIndex
CREATE INDEX "RubricTemplate_ownerId_idx" ON "RubricTemplate"("ownerId");

-- CreateIndex
CREATE INDEX "RubricTemplate_isShared_idx" ON "RubricTemplate"("isShared");

-- CreateIndex
CREATE UNIQUE INDEX "PlacementResult_attemptId_key" ON "PlacementResult"("attemptId");

-- CreateIndex
CREATE INDEX "PlacementResult_studentId_createdAt_idx" ON "PlacementResult"("studentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Application_reference_key" ON "Application"("reference");

-- CreateIndex
CREATE INDEX "Application_status_createdAt_idx" ON "Application"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Application_levelId_intakeId_status_idx" ON "Application"("levelId", "intakeId", "status");

-- CreateIndex
CREATE INDEX "Application_email_idx" ON "Application"("email");

-- CreateIndex
CREATE INDEX "Assignment_lessonId_idx" ON "Assignment"("lessonId");

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentExtension" ADD CONSTRAINT "AssignmentExtension_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentExtension" ADD CONSTRAINT "AssignmentExtension_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentExtension" ADD CONSTRAINT "AssignmentExtension_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackComment" ADD CONSTRAINT "FeedbackComment_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricTemplate" ADD CONSTRAINT "RubricTemplate_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlacementResult" ADD CONSTRAINT "PlacementResult_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlacementResult" ADD CONSTRAINT "PlacementResult_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlacementResult" ADD CONSTRAINT "PlacementResult_recommendedLevelId_fkey" FOREIGN KEY ("recommendedLevelId") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlacementResult" ADD CONSTRAINT "PlacementResult_chosenLevelId_fkey" FOREIGN KEY ("chosenLevelId") REFERENCES "Level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlacementResult" ADD CONSTRAINT "PlacementResult_assignedLevelId_fkey" FOREIGN KEY ("assignedLevelId") REFERENCES "Level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlacementResult" ADD CONSTRAINT "PlacementResult_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "Intake"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Default placement bands for the general levels (percentage of the placement test).
-- Specialised levels (e.g. B1-BERUF, B2-TESTDAF) stay NULL: placement never recommends them.
UPDATE "Level" SET "placementMinScore" = CASE "code"
  WHEN 'A1' THEN 0 WHEN 'A2' THEN 30 WHEN 'B1' THEN 55 WHEN 'B2' THEN 80 END
WHERE "code" IN ('A1', 'A2', 'B1', 'B2') AND "placementMinScore" IS NULL;
