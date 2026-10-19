-- Teachers can be added to intakes directly (not only through a class).
CREATE TABLE "TeacherIntake" (
  "teacherId" TEXT NOT NULL,
  "intakeId" TEXT NOT NULL,
  "assignedById" TEXT,
  "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TeacherIntake_pkey" PRIMARY KEY ("teacherId", "intakeId"),
  CONSTRAINT "TeacherIntake_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TeacherIntake_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "Intake"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TeacherIntake_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "TeacherIntake_intakeId_idx" ON "TeacherIntake"("intakeId");

-- Every teacher already running a class in an intake is a member of it.
INSERT INTO "TeacherIntake" ("teacherId", "intakeId")
SELECT DISTINCT "teacherId", "intakeId" FROM "ClassGroup" WHERE "teacherId" IS NOT NULL
ON CONFLICT DO NOTHING;

-- Suspension (ban) reason, shown to the student when they sign in.
ALTER TABLE "User" ADD COLUMN "suspendedReason" TEXT,
ADD COLUMN "suspendedAt" TIMESTAMP(3),
ADD COLUMN "suspendedById" TEXT;
