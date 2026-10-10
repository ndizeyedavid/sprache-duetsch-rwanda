import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { unlink, writeFile } from 'node:fs/promises';
import { badRequest, notFound } from '../../lib/http-error.js';
import { prisma } from '../../lib/prisma.js';
import { updateMyProfile } from '../auth/update-my-profile.js';
import { avatarImageType } from './avatar-image.js';
import { safeFilePath } from './uploads.service.js';

export async function uploadAvatar(req: Request, res: Response): Promise<void> {
  if (!req.file) throw badRequest('Choose a profile photo');
  const type = avatarImageType(req.file.buffer);
  const name = `avatar-${randomUUID()}${type.extension}`;
  const url = `/api/uploads/avatars/${name}`;
  const path = safeFilePath(name)!;
  await writeFile(path, req.file.buffer, { flag: 'wx' });
  try {
    await prisma.uploadedFile.create({ data: { name, uploaderId: req.user!.id, mimeType: type.mime } });
    const user = await updateMyProfile(req.user!.id, { avatarUrl: url });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    await unlink(path).catch(() => undefined);
    await prisma.uploadedFile.deleteMany({ where: { name } });
    throw error;
  }
}

/** Only current profile photos are image-accessible; course uploads stay protected. */
export async function getAvatar(req: Request, res: Response): Promise<void> {
  const name = String(req.params.name);
  const path = safeFilePath(name);
  if (!path || !/^avatar-[a-f0-9-]+\.(png|jpg|webp)$/.test(name)) throw notFound('Photo not found');
  const [file, owner] = await Promise.all([
    prisma.uploadedFile.findUnique({ where: { name } }),
    prisma.user.findFirst({ where: { avatarUrl: `/api/uploads/avatars/${name}` }, select: { id: true } }),
  ]);
  if (!file || !owner || !['image/png', 'image/jpeg', 'image/webp'].includes(file.mimeType)) throw notFound('Photo not found');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.type(file.mimeType).sendFile(path);
}
