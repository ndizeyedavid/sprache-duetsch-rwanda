-- Course v2 (2026-10-22): structured lessons with English help, audio and a glossary,
-- plus Duolingo-style practice sessions (one question per screen, checked instantly).
ALTER TYPE "ActivityType" ADD VALUE 'PRACTICE';
ALTER TABLE "Lesson" ADD COLUMN "content" JSONB;
