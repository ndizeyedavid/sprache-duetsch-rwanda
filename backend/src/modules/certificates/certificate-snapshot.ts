import type { Prisma } from '../../generated/prisma/client.js';
import { notFound } from '../../lib/http-error.js';
import { prisma } from '../../lib/prisma.js';
import type { IssueCertificateInput } from './certificates.schema.js';
import { defaultCertificateDesign } from './certificate-document.js';
import type { CertificateSnapshot } from './certificate-document.js';

export async function buildCertificateSnapshot(input: IssueCertificateInput, actorId?: string, tx: Prisma.TransactionClient = prisma): Promise<CertificateSnapshot> {
  const student = await tx.student.findUnique({ where: { id: input.studentId }, include: { user: { select: { firstName: true, lastName: true } } } });
  const level = await tx.level.findUnique({ where: { id: input.levelId } });
  if (!student || !level) throw notFound('Student or level not found');
  const issuer = actorId ? await tx.user.findUnique({ where: { id: actorId }, select: { firstName: true, lastName: true } }) : null;
  return {
    version: 1, studentName: `${student.user.firstName} ${student.user.lastName}`.trim(), studentCode: student.studentCode,
    levelCode: level.code, levelTitle: level.title,
    design: input.design ?? defaultCertificateDesign(issuer ? `${issuer.firstName} ${issuer.lastName}`.trim() : undefined),
  };
}
