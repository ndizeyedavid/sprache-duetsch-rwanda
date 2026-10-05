CREATE TABLE "TeacherLevel" (
 "teacherId" TEXT NOT NULL, "levelId" TEXT NOT NULL, "assignedById" TEXT,
 "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "TeacherLevel_pkey" PRIMARY KEY ("teacherId", "levelId"),
 CONSTRAINT "TeacherLevel_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT "TeacherLevel_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT "TeacherLevel_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "TeacherLevel_levelId_idx" ON "TeacherLevel"("levelId");
INSERT INTO "TeacherLevel" ("teacherId", "levelId")
SELECT DISTINCT c."teacherId", c."levelId" FROM "ClassGroup" c JOIN "User" u ON u.id=c."teacherId"
WHERE c."teacherId" IS NOT NULL AND u.role='TEACHER';
