import { conflict,notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { issueCertificate } from './issue-certificate.js';
import { readCertificateSnapshot } from './certificate-document.js';
export const reissueCertificate = async (id: string, actorId?: string) => {
  const before = await prisma.certificate.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Certificate not found");
  }
  if (before.status === "ISSUED") {
    throw conflict(
      "Certificate is still valid — revoke it first or issue is blocked by the existing copy",
    );
  }
  return issueCertificate(
    {
      studentId: before.studentId,
      levelId: before.levelId,
      enrollmentId: before.enrollmentId ?? undefined,
      design: readCertificateSnapshot(before.metadata)?.design,
      pdfUrl: before.pdfUrl ?? undefined,
      replacesCertificateId: before.id,
    },
    actorId,
  );
};
