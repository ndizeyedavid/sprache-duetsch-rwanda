import { readFile } from 'node:fs/promises';
import { badRequest, notFound } from '../../lib/http-error.js';
import { prisma } from '../../lib/prisma.js';
import { safeFilePath } from '../uploads/uploads.service.js';

export async function readCertificateUpload(url: string): Promise<Buffer> {
  const match = /^\/api\/uploads\/([a-zA-Z0-9._-]+)$/.exec(url);
  const path = match ? safeFilePath(match[1]) : null;
  if (!path) throw badRequest('Choose a PDF uploaded through the certificate form');
  const file = await prisma.uploadedFile.findUnique({ where: { name: match![1] } });
  if (!file || file.mimeType !== 'application/pdf') throw badRequest('The certificate must be an uploaded PDF');
  const buffer = await readFile(path).catch(() => { throw notFound('The uploaded certificate file is unavailable'); });
  if (buffer.length > 25 * 1024 * 1024 || buffer.subarray(0, 5).toString() !== '%PDF-' || !buffer.subarray(-1024).includes('%%EOF')) {
    throw badRequest('The uploaded file is not a complete PDF');
  }
  return buffer;
}
