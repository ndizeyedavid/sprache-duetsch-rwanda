import { forbidden,notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { certificateInclude } from './certificate-include.js';
export const getCertificate = async (id: string, userId: string, role: string) => {
  if (!['STUDENT', 'ACADEMIC_ADMIN', 'SUPER_ADMIN'].includes(role)) throw forbidden('Certificates are available to the student and academic administration');
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
