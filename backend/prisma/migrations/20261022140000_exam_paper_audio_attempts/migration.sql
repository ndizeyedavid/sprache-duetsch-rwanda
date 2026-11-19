-- Past papers (2026-10-22): listening recordings per paper and saved online answer-sheet results.
-- CreateTable
CREATE TABLE "ExamPaperAudio" (
    "id" TEXT NOT NULL,
    "paperId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ExamPaperAudio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamPaperAttempt" (
    "id" TEXT NOT NULL,
    "paperId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "responses" JSONB NOT NULL,
    "sections" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamPaperAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExamPaperAudio_paperId_idx" ON "ExamPaperAudio"("paperId");

-- CreateIndex
CREATE INDEX "ExamPaperAttempt_paperId_studentId_idx" ON "ExamPaperAttempt"("paperId", "studentId");

-- AddForeignKey
ALTER TABLE "ExamPaperAudio" ADD CONSTRAINT "ExamPaperAudio_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "ExamPaper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamPaperAttempt" ADD CONSTRAINT "ExamPaperAttempt_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "ExamPaper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamPaperAttempt" ADD CONSTRAINT "ExamPaperAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
