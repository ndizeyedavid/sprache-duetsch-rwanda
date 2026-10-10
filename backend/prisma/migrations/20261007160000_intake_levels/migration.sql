CREATE TABLE "_IntakeLevels" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL,
  CONSTRAINT "_IntakeLevels_A_fkey" FOREIGN KEY ("A") REFERENCES "Intake"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "_IntakeLevels_B_fkey" FOREIGN KEY ("B") REFERENCES "Level"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "_IntakeLevels_AB_unique" ON "_IntakeLevels"("A", "B");
CREATE INDEX "_IntakeLevels_B_index" ON "_IntakeLevels"("B");
-- Preserve only known intake/level relationships; never invent course offerings.
INSERT INTO "_IntakeLevels" ("A", "B")
SELECT "intakeId", "levelId" FROM "ClassGroup"
UNION SELECT "intakeId", "levelId" FROM "Enrollment"
UNION SELECT "intakeId", "intendedLevelId" FROM "Student" WHERE "intakeId" IS NOT NULL AND "intendedLevelId" IS NOT NULL;
