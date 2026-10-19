-- One sign-in = one session id, kept across refresh rotation. Students may hold one active session.
ALTER TABLE "RefreshToken" ADD COLUMN "sessionId" TEXT;
UPDATE "RefreshToken" SET "sessionId" = "id" WHERE "sessionId" IS NULL;
ALTER TABLE "RefreshToken" ALTER COLUMN "sessionId" SET NOT NULL;
CREATE INDEX "RefreshToken_sessionId_idx" ON "RefreshToken"("sessionId");

ALTER TABLE "User" ADD COLUMN "activeSessionId" TEXT;
