import { env } from '../../config/env.js';
import { conflict, notFound } from '../../lib/http-error.js';
import { prisma } from '../../lib/prisma.js';
import { defaultCertificateDesign, readCertificateSnapshot } from './certificate-document.js';
import { createCertificatePdf } from './certificate-pdf.js';
import { readCertificateUpload } from './certificate-upload.js';

export async function renderCertificatePdf(id: string): Promise<Buffer> {
  const certificate = await prisma.certificate.findUnique({ where: { id }, include: {
    student: { select: { studentCode: true, user: { select: { firstName: true, lastName: true } } } },
    level: { select: { code: true, title: true } }, issuedBy: { select: { firstName: true, lastName: true } },
  } });
  if (!certificate) throw notFound('Certificate not found');
  if (certificate.status === 'REVOKED') throw conflict('This certificate was revoked. View its verification record for details.');
  if (certificate.pdfUrl) return readCertificateUpload(certificate.pdfUrl);
  const issuer = certificate.issuedBy;
  const document = readCertificateSnapshot(certificate.metadata) ?? {
    version: 1 as const, studentName: `${certificate.student.user.firstName} ${certificate.student.user.lastName}`.trim(),
    studentCode: certificate.student.studentCode, levelCode: certificate.level.code, levelTitle: certificate.level.title,
    design: defaultCertificateDesign(issuer ? `${issuer.firstName} ${issuer.lastName}` : undefined, certificate.issuedAt),
  };
  return createCertificatePdf({ document, certificateNumber: certificate.certificateNumber, verificationCode: certificate.verificationCode,
    issuedAt: certificate.issuedAt, verifyUrl: `${env.PUBLIC_APP_URL.replace(/\/$/, '')}/verify/${certificate.verificationCode}` });
}
