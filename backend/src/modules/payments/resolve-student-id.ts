import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
export const resolveStudentId = async (userId: string): Promise<string> => {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!student) {
    throw notFound("Student profile not found");
  }
  return student.id;
};
