import type { Request,Response } from "express";
import { existsSync } from "node:fs";
import { unlink } from "node:fs/promises";
import { matchesFileSignature } from "../../lib/file-signature.js";
import { badRequest,notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { assertFileAccess } from "./file-access.js";
import { safeFilePath } from "./uploads.service.js";

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    throw badRequest("No file received — send multipart field 'file'");
  }
  if (!(await matchesFileSignature(req.file.path, req.file.mimetype))) {
    await unlink(req.file.path).catch(() => undefined);
    throw badRequest("The file contents do not match its format. Choose a valid file");
  }
  await prisma.uploadedFile.create({ data: { name: req.file.filename, uploaderId: req.user!.id, mimeType: req.file.mimetype } });
  res.status(201).json({
    success: true,
    data: {
      url: `/api/uploads/${req.file.filename}`,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      originalName: req.file.originalname,
    },
  });
};

export const downloadFile = async (req: Request, res: Response): Promise<void> => {
  const { name } = req.params as { name: string };
  const filePath = safeFilePath(name);
  if (!filePath || !existsSync(filePath)) {
    throw notFound("File not found");
  }
  await assertFileAccess(req.user!, name);
  const stored = await prisma.uploadedFile.findUnique({ where: { name }, select: { mimeType: true } });
  // Serve with the verified type only; browsers must never sniff uploads into HTML.
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (stored) res.type(stored.mimeType);
  else res.setHeader("Content-Disposition", "attachment");
  res.sendFile(filePath);
};
