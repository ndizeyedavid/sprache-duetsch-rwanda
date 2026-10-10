import type { Request,Response } from "express";
import { existsSync } from "node:fs";
import { badRequest,notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { assertFileAccess } from "./file-access.js";
import { safeFilePath } from "./uploads.service.js";

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    throw badRequest("No file received — send multipart field 'file'");
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
  res.sendFile(filePath);
};
