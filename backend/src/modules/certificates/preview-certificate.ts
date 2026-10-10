import { badRequest } from '../../lib/http-error.js';
import { prisma } from '../../lib/prisma.js';
import { createCertificatePdf } from './certificate-pdf.js';
import { buildCertificateSnapshot } from './certificate-snapshot.js';
import { readCertificateUpload } from './certificate-upload.js';
import type { IssueCertificateInput } from './certificates.schema.js';

export async function previewCertificate(input: IssueCertificateInput, actorId?: string): Promise<Buffer> {
  const document = await buildCertificateSnapshot(input, actorId);
  const enrollment = await prisma.enrollment.findFirst({ where: {
    studentId: input.studentId, levelId: input.levelId, status: { in: ['ACTIVE', 'COMPLETED'] },
  } });
  if (!enrollment) throw badRequest('Select a course this student is enrolled in or has completed');
  if (input.pdfUrl) return readCertificateUpload(input.pdfUrl);
  return createCertificatePdf({ document, certificateNumber: 'Assigned on issue', verificationCode: '',
    issuedAt: new Date(), verifyUrl: '', preview: true });
}
