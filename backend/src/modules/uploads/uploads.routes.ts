import type { NextFunction,Request,Response } from "express";
import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { badRequest } from "../../lib/http-error.js";
import { ACADEMIC_ROLES } from "../../lib/roles.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import * as controller from "./uploads.controller.js";
import { upload } from "./uploads.service.js";

export const uploadsRouter = Router();

uploadsRouter.use(requireAuth);

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
