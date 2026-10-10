import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { getStudentProgress } from "./get-student-progress.js";
export const getMyProgress = async (userId: string) => {
  const student = await prisma.student.findUnique({ where: { userId }, select: { id: true } });
  if (!student) {
    throw notFound("Student profile not found");
  }
  return getStudentProgress(student.id);
};
