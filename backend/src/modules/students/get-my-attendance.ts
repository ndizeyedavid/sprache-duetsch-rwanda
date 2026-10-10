import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { getStudentAttendance } from "./get-student-attendance.js";
export const getMyAttendance = async (userId: string) => {
  const student = await prisma.student.findUnique({ where: { userId }, select: { id: true } });
  if (!student) {
    throw notFound("Student profile not found");
  }
  return getStudentAttendance(student.id);
};
