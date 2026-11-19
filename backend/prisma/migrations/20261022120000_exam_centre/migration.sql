-- Exam centre (2026-10-22): exam-style test sections and downloadable exam papers with answer keys.
-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN "sections" JSONB;

-- CreateTable
CREATE TABLE "ExamPaper" (
    "id" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'Goethe-Institut',
    "edition" TEXT,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "sizeBytes" INTEGER,
    "sourceUrl" TEXT,
    "answerKey" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamPaper_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExamPaper_levelId_isPublished_idx" ON "ExamPaper"("levelId", "isPublished");

-- AddForeignKey
ALTER TABLE "ExamPaper" ADD CONSTRAINT "ExamPaper_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE CASCADE ON UPDATE CASCADE;
