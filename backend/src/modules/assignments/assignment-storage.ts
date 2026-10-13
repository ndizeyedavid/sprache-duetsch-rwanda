import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { matchesFileSignature } from "../../lib/file-signature.js";
import { badRequest } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";

export const directory = path.resolve(process.cwd(), "uploads", "assignments");
mkdirSync(directory, { recursive: true });
const accepted = new Set([
  "application/pdf", "image/png", "image/jpeg", "image/webp",
  "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/webm", "audio/ogg", "audio/mp4",
]);
const upload = multer({
  storage: multer.diskStorage({ destination: directory, filename: (_req, _file, cb) => cb(null, randomUUID()) }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (accepted.has(file.mimetype)) cb(null, true);
    else cb(new Error("Use PDF, PNG, JPG, WebP or audio (maximum 10 MB)"));
  },
});

/**
 * Receives one multipart `file`, checks its real contents, and stores it as an AssignmentFile
 * owned by `uploaderId`. Responds 201 with the file metadata; rejected files are deleted.
 */
export function storeAssignmentFile(req: Request, res: Response, next: NextFunction, target: { assignmentId: string; uploaderId: string; audioOnly: boolean }): void {
  upload.single("file")(req, res, (err: unknown) => {
    if (err) {
      next(badRequest(err instanceof Error ? err.message : "Upload failed"));
      return;
    }
    void (async () => {
      const file = req.file;
      if (!file) throw badRequest("Choose a file to upload");
      try {
        if (target.audioOnly && !file.mimetype.startsWith("audio/")) throw badRequest("Choose an audio file");
        if (!(await matchesFileSignature(file.path, file.mimetype)))
          throw badRequest("The file contents do not match its format. Choose a valid file");
        const result = await prisma.assignmentFile.create({
          data: {
            assignmentId: target.assignmentId, uploaderId: target.uploaderId, storageName: file.filename,
            originalName: path.basename(file.originalname).slice(0, 200), mimeType: file.mimetype, sizeBytes: file.size,
          },
        });
        res.status(201).json({ success: true, data: { id: result.id, originalName: result.originalName, mimeType: result.mimeType, sizeBytes: result.sizeBytes } });
      } catch (e) {
        await unlink(file.path).catch(() => {});
        throw e;
      }
    })().catch(next);
  });
}
