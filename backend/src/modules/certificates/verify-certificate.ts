import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { readCertificateSnapshot } from './certificate-document.js';

/**
 * Public verification: only what a third party needs to trust the certificate.
 * Lessons, scores and student identifiers stay private.
 */
export const verifyCertificate = async (code: string) => {
  const normalized = code.trim().toUpperCase();
  const certificate = await prisma.certificate.findFirst({
    where: { OR: [{ verificationCode: normalized }, { certificateNumber: normalized }] },
    include: {
      student: { select: { user: { select: { firstName: true, lastName: true } } } },
      level: { select: { code: true, title: true } },
    },
  });
  if (!certificate) throw notFound("No certificate matches this code");

  const document = readCertificateSnapshot(certificate.metadata);
  return {
    valid: certificate.status === "ISSUED",
    status: certificate.status,
    certificateNumber: certificate.certificateNumber,
    verificationCode: certificate.verificationCode,
    studentName: document?.studentName ?? `${certificate.student.user.firstName} ${certificate.student.user.lastName}`.trim(),
    levelCode: document?.levelCode ?? certificate.level.code,
    levelTitle: document?.levelTitle ?? certificate.level.title,
    completionDate: document?.design.completionDate ?? null,
    grade: document?.design.grade ?? null,
    issuedAt: certificate.issuedAt,
    issuedBy: document?.design.signatoryName ?? null,
    issuedByRole: document?.design.signatoryRole ?? null,
    revokedAt: certificate.revokedAt,
  };
};
