import type { Request, Response } from "express";
import { existsSync } from "node:fs";
import { badRequest, notFound } from "../../lib/http-error.js";
import { safeFilePath } from "./uploads.service.js";

export const uploadFile = (req: Request, res: Response): void => {
  if (!req.file) {
    throw badRequest("No file received — send multipart field 'file'");
  }
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

export const downloadFile = (req: Request, res: Response): void => {
  const { name } = req.params as { name: string };
  const filePath = safeFilePath(name);
  if (!filePath || !existsSync(filePath)) {
    throw notFound("File not found");
  }
  res.sendFile(filePath);
};
