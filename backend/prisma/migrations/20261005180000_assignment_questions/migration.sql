ALTER TABLE "Assignment" ADD COLUMN "questions" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "AssignmentSubmission" ADD COLUMN "responses" JSONB NOT NULL DEFAULT '{}', ADD COLUMN "questionScores" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "AssignmentVersion" ADD COLUMN "responses" JSONB NOT NULL DEFAULT '{}', ADD COLUMN "questionScores" JSONB NOT NULL DEFAULT '[]';
