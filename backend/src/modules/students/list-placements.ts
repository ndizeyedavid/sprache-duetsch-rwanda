import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { placementResultSelect } from "./placement-view.js";

/** Full placement history of one student (newest first) for academic staff. */
export const listStudentPlacements = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      studentCode: true,
      status: true,
      placementScore: true,
      user: { select: { firstName: true, lastName: true, email: true } },
      intendedLevel: { select: { id: true, code: true, title: true, levelLabel: true } },
      currentLevel: { select: { id: true, code: true, title: true, levelLabel: true } },
    },
  });
  if (!student) throw notFound("Student not found");
  const results = await prisma.placementResult.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    select: placementResultSelect,
  });
  return { student, results };
};

/** Results still waiting for a staff decision, oldest first so nobody waits too long. */
export const listPlacementQueue = async () =>
  prisma.placementResult.findMany({
    where: { assignedLevelId: null },
    orderBy: { createdAt: "asc" },
    take: 100,
    select: {
      ...placementResultSelect,
      student: {
        select: { id: true, studentCode: true, status: true, user: { select: { firstName: true, lastName: true, email: true } } },
      },
    },
  });
