import { mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import multer from "multer";

// Disk storage for teacher-uploaded materials (audio, images, PDFs, worksheets).
// Files live under ./uploads (gitignored) and are served through an
// authenticated route — URLs are unlisted, never public.
export const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/webm",
  "audio/ogg",
  "video/mp4",
  "video/webm",
  "application/pdf",
]);

const MAX_FILE_BYTES = 25 * 1024 * 1024;

export const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, callback) => {
      const ext = path.extname(file.originalname).toLowerCase();
      callback(null, `${Date.now()}-${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: MAX_FILE_BYTES },
  fileFilter: (_req, file, callback) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error(`File type ${file.mimetype} is not allowed`));
    }
  },
});

export const safeFilePath = (name: string): string | null => {
  const base = path.basename(name);
  if (!base || base !== name || base.startsWith(".")) {
    return null;
  }
  return path.join(UPLOAD_DIR, base);
};
