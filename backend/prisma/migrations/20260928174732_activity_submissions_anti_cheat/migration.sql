-- ActivitySubmission + anti-cheat columns were added to schema.prisma in b196f06/41d5a63
-- without a migration. Every statement is guarded so `migrate deploy` succeeds whether
-- or not a database already received these objects through `prisma db push`.

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "ActivitySubmissionStatus" AS ENUM ('SUBMITTED', 'GRADED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable
ALTER TABLE "Attempt" ADD COLUMN IF NOT EXISTS "cheatCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "cheatFlagged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "cheatLog" JSONB DEFAULT '[]';

-- CreateTable
CREATE TABLE IF NOT EXISTS "ActivitySubmission" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "response" JSONB,
    "isCorrect" BOOLEAN,
    "score" DECIMAL(5,2),
    "maxScore" DECIMAL(5,2) NOT NULL DEFAULT 1,
    "status" "ActivitySubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "feedback" TEXT,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gradedAt" TIMESTAMP(3),
    "gradedById" TEXT,
    "cheatCount" INTEGER NOT NULL DEFAULT 0,
    "cheatFlagged" BOOLEAN NOT NULL DEFAULT false,
    "cheatLog" JSONB DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivitySubmission_pkey" PRIMARY KEY ("id")
);

-- A table pushed before b196f06 lacks the anti-cheat columns.
ALTER TABLE "ActivitySubmission" ADD COLUMN IF NOT EXISTS "cheatCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "cheatFlagged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "cheatLog" JSONB DEFAULT '[]';

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ActivitySubmission_studentId_idx" ON "ActivitySubmission"("studentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ActivitySubmission_activityId_idx" ON "ActivitySubmission"("activityId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ActivitySubmission_status_idx" ON "ActivitySubmission"("status");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ActivitySubmission_activityId_studentId_key" ON "ActivitySubmission"("activityId", "studentId");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "ActivitySubmission" ADD CONSTRAINT "ActivitySubmission_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "ActivitySubmission" ADD CONSTRAINT "ActivitySubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "ActivitySubmission" ADD CONSTRAINT "ActivitySubmission_gradedById_fkey" FOREIGN KEY ("gradedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
