-- Replace the registration window dates with a single open/closed switch.
ALTER TABLE "Intake" ADD COLUMN "registrationOpen" BOOLEAN NOT NULL DEFAULT true;

-- Keep today's behaviour: an intake whose window has not opened yet or has already closed starts closed.
UPDATE "Intake"
SET "registrationOpen" = false
WHERE ("enrollmentOpensAt" IS NOT NULL AND "enrollmentOpensAt" > NOW())
   OR ("enrollmentEndsAt" IS NOT NULL AND "enrollmentEndsAt" < NOW());

ALTER TABLE "Intake" DROP COLUMN "enrollmentOpensAt",
DROP COLUMN "enrollmentEndsAt";
