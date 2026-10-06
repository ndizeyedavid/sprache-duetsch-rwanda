import { forbidden,notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { certificateInclude } from './certificate-include.js';
export const getCertificate = async (id: string, userId: string, role: string) => {
  const certificate = await prisma.certificate.findUnique({
    where: { id },
    include: certificateInclude,
  });
  if (!certificate) {
    throw notFound("Certificate not found");
  }
  if (role === "STUDENT") {
    const student = await prisma.student.findUnique({ where: { userId }, select: { id: true } });
    if (!student || student.id !== certificate.studentId) {
      throw forbidden("You can only view your own certificates");
    }
  }
  return certificate;
};
