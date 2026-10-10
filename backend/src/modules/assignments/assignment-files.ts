import type { NextFunction,Request,Response } from "express";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { badRequest,notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { getStaffAssignment,getStudentAssignment } from "./assignment-access.js";
import { checkEditable } from "./assignment-policy.js";
import { matchesFileSignature } from "./file-signature.js";
const directory = path.resolve(process.cwd(), "uploads", "assignments");
mkdirSync(directory, { recursive: true });
const accepted = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
]);
const upload = multer({
  storage: multer.diskStorage({
    destination: directory,
    filename: (_req, _file, cb) => cb(null, randomUUID()),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (accepted.has(file.mimetype)) cb(null, true);
    else cb(new Error("Use PDF, PNG, JPG, WebP or audio (maximum 10 MB)"));
  },
});
export const receiveFile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { assignment, profile } = await getStudentAssignment(req.user!.id, id);
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { assignmentId_studentId: { assignmentId: id, studentId: profile.studentId } },
    });
    checkEditable(assignment, submission);
    if (assignment.responseType === "TEXT") throw badRequest("This assignment accepts text only");
    if (
      (await prisma.assignmentFile.count({
        where: { assignmentId: id, uploaderId: req.user!.id },
      })) >= 100
    )
      throw badRequest("Attachment limit reached. Contact your teacher");
    upload.single("file")(req, res, (err: unknown) => {
      if (err) {
        next(badRequest(err instanceof Error ? err.message : "Upload failed"));
        return;
      }
      void (async () => {
        if (!req.file) throw badRequest("Choose a file to upload");
        if (assignment.responseType === "AUDIO" && !req.file.mimetype.startsWith("audio/")) {
          await unlink(req.file.path);
          throw badRequest("Choose an audio file");
        }
        try {
          if (!(await matchesFileSignature(req.file.path, req.file.mimetype)))
            throw badRequest("The file contents do not match its format. Choose a valid file");
          const result = await prisma.assignmentFile.create({
            data: {
              assignmentId: id,
              uploaderId: req.user!.id,
              storageName: req.file.filename,
              originalName: path.basename(req.file.originalname).slice(0, 200),
              mimeType: req.file.mimetype,
              sizeBytes: req.file.size,
            },
          });
          res
            .status(201)
            .json({
              success: true,
              data: {
                id: result.id,
                originalName: result.originalName,
                mimeType: result.mimeType,
                sizeBytes: result.sizeBytes,
              },
            });
        } catch (e) {
          await unlink(req.file.path).catch(() => {});
          throw e;
        }
      })().catch(next);
    });
  } catch (e) {
    next(e);
  }
};
export const downloadAttachment = async (req: Request, res: Response): Promise<void> => {
  const file = await prisma.assignmentFile.findUnique({
    where: { id: req.params.fileId as string },
  });
  if (!file || file.assignmentId !== req.params.id) throw notFound("Attachment not found");
  if (req.user!.role === "STUDENT") {
    await getStudentAssignment(req.user!.id, file.assignmentId);
    if (file.uploaderId !== req.user!.id) throw notFound("Attachment not found");
  } else {
    await getStaffAssignment(req.user!, file.assignmentId);
    if (
      !(await prisma.assignmentVersion.findFirst({
        where: { fileIds: { has: file.id }, submission: { assignmentId: file.assignmentId } },
      }))
    )
      throw notFound("Only submitted attachments can be downloaded");
  }
  res.setHeader("Cache-Control", "private, no-store");
  await new Promise<void>((resolve, reject) =>
    res.download(path.join(directory, file.storageName), file.originalName, (e) =>
      e ? reject(e) : resolve(),
    ),
  );
};
