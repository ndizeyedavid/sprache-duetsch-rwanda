import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
export const listMyCertificates = async (userId: string) => {
  const student = await prisma.student.findUnique({ where: { userId }, select: { id: true } });
  if (!student) {
    throw notFound("Student profile not found");
  }
  return prisma.certificate.findMany({
    where: { studentId: student.id },
    orderBy: { issuedAt: "desc" },
    include: { level: { select: { id: true, code: true, title: true } } },
  });
};
