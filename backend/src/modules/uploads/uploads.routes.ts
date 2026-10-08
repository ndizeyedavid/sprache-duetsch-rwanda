import type { NextFunction,Request,Response } from "express";
import { Router } from "express";
import multer from 'multer';
import { asyncHandler } from "../../lib/async-handler.js";
import { badRequest } from "../../lib/http-error.js";
import { ACADEMIC_ROLES } from "../../lib/roles.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import * as controller from "./uploads.controller.js";
import { upload } from "./uploads.service.js";
import { getAvatar, uploadAvatar } from './avatar.controller.js';

export const uploadsRouter = Router();

uploadsRouter.get('/avatars/:name', asyncHandler(getAvatar));
uploadsRouter.use(requireAuth);

const avatarUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } });
uploadsRouter.post('/avatar', (req, res, next) => {
  avatarUpload.single('file')(req, res, (error: unknown) => {
    if (error) { next(badRequest('Choose a JPG, PNG or WebP photo up to 5 MB')); return; }
    void uploadAvatar(req, res).catch(next);
  });
});

uploadsRouter.post(
  "/",
  requireRole(...ACADEMIC_ROLES),
  (req: Request, res: Response, next: NextFunction) => {
    upload.single("file")(req, res, (error: unknown) => {
      try {
        if (error) {
          throw badRequest(error instanceof Error ? error.message : "Upload failed");
        }
        void controller.uploadFile(req, res).catch(next);
      } catch (thrown) {
        next(thrown);
      }
    });
  },
);

uploadsRouter.get("/:name", asyncHandler(controller.downloadFile));
