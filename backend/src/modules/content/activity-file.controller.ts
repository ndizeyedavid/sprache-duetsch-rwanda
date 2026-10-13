import type { NextFunction,Request,Response } from "express";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { unlink } from "node:fs/promises";
import { EXTENSION_BY_MIME,matchesFileSignature } from "../../lib/file-signature.js";
import { badRequest } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { UPLOAD_DIR } from "../uploads/uploads.service.js";
import {
acceptedActivityFileTypes,
activityFilePrefix,
MAX_ACTIVITY_FILE_BYTES,
MAX_ACTIVITY_FILES_PER_STUDENT,
} from "./activity-file-policy.js";
import { loadStudentActivity } from "./student-activity-access.js";

const uploadError = (error: unknown) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") return badRequest("Files must be 10 MB or smaller. Try a shorter recording");
  return badRequest(error instanceof Error ? error.message : "Upload failed");
};

/** Store the uploaded part only when its bytes match the declared format. */
async function storeUpload(req: Request, res: Response): Promise<void> {
  if (!req.file) throw badRequest("Choose a file to upload — send multipart field 'file'");
  try {
    if (!(await matchesFileSignature(req.file.path, req.file.mimetype))) throw badRequest("The file contents do not match its format. Choose a valid file");
    await prisma.uploadedFile.create({ data: { name: req.file.filename, uploaderId: req.user!.id, mimeType: req.file.mimetype } });
  } catch (error) {
    await unlink(req.file.path).catch(() => undefined);
    throw error;
  }
  res.status(201).json({ success: true, data: { fileUrl: `/api/uploads/${req.file.filename}`, mimeType: req.file.mimetype, sizeBytes: req.file.size } });
}

/**
 * POST /content/activities/:id/files — a student's recording (SPEAKING,
 * PRONUNCIATION) or document (WRITING document submission). The student must be
 * able to open the activity; the server picks the stored name and extension.
 */
export const uploadActivityFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const activityId = String(req.params.id);
    const { activity } = await loadStudentActivity(req.user!.id, activityId);
    const accepted = acceptedActivityFileTypes(activity.type, activity.config);
    if (accepted.length === 0) throw badRequest("This activity does not accept files");
    const prefix = activityFilePrefix(activityId);
    const uploads = await prisma.uploadedFile.count({ where: { uploaderId: req.user!.id, name: { startsWith: prefix } } });
    if (uploads >= MAX_ACTIVITY_FILES_PER_STUDENT) throw badRequest("Upload limit reached for this activity. Ask your teacher for help");
    const upload = multer({
      storage: multer.diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, callback) => callback(null, `${prefix}${randomUUID()}${EXTENSION_BY_MIME[file.mimetype] ?? ""}`),
      }),
      limits: { fileSize: MAX_ACTIVITY_FILE_BYTES, files: 1 },
      fileFilter: (_req, file, callback) => {
        if (accepted.includes(file.mimetype)) callback(null, true);
        else callback(new Error(activity.type === "WRITING" ? "Upload a PDF, PNG, JPG or WebP file" : "Upload an audio recording (WebM, Ogg, MP4/M4A, MP3 or WAV)"));
      },
    });
    upload.single("file")(req, res, (error: unknown) => {
      if (error) { next(uploadError(error)); return; }
      void storeUpload(req, res).catch(next);
    });
  } catch (error) {
    next(error);
  }
};
