import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import { levelIdParamsSchema } from "./content.schema.js";
import { coursebookInfo,coursebookPdf } from "./coursebook.controller.js";

export const coursebookRouter = Router();
coursebookRouter.get("/my/levels/:levelId/coursebook", requireAuth, requireRole("STUDENT"), validate({ params: levelIdParamsSchema }), asyncHandler(coursebookInfo));
coursebookRouter.get("/my/levels/:levelId/coursebook/pdf", requireAuth, requireRole("STUDENT"), validate({ params: levelIdParamsSchema }), asyncHandler(coursebookPdf));
