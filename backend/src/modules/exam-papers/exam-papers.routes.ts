// Exam centre: students see their courses' exam papers and tests and check answer sheets; academic
// admins manage the papers.
import type { Request,Response } from "express";
import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { actorId,validatedBody,validatedParams } from "../../lib/request.js";
import { ADMIN_ROLES } from "../../lib/roles.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import type { CheckSheetBody,PaperBody } from "./exam-papers.schema.js";
import { checkSheetSchema,paperBodySchema,paperIdSchema } from "./exam-papers.schema.js";
import { createExamPaper,deleteExamPaper,listExamPapers,updateExamPaper } from "./manage-exam-papers.js";
import { getMyExamCentre } from "./my-exam-centre.js";
import { checkMyPaperSheet,getMyPaperSheet } from "./paper-sheet.js";

export const examPapersRouter = Router();
examPapersRouter.use(requireAuth);

const id = (req: Request) => validatedParams<{ id: string }>(req).id;
const send = (res: Response, data: unknown, status = 200) => { res.status(status).json({ success: true, data }); };

examPapersRouter.get("/my", requireRole("STUDENT"), asyncHandler(async (req, res) => send(res, await getMyExamCentre(req.user!.id))));
examPapersRouter.get("/my/:id/sheet", requireRole("STUDENT"), validate({ params: paperIdSchema }),
  asyncHandler(async (req, res) => send(res, await getMyPaperSheet(req.user!.id, id(req)))));
examPapersRouter.post("/my/:id/check", requireRole("STUDENT"), validate({ params: paperIdSchema, body: checkSheetSchema }),
  asyncHandler(async (req, res) => send(res, await checkMyPaperSheet(req.user!.id, id(req), validatedBody<CheckSheetBody>(req).responses))));

const staff = requireRole(...ADMIN_ROLES);
examPapersRouter.get("/", staff, asyncHandler(async (_req, res) => send(res, await listExamPapers())));
examPapersRouter.post("/", staff, validate({ body: paperBodySchema }),
  asyncHandler(async (req, res) => send(res, await createExamPaper(validatedBody<PaperBody>(req), actorId(req)), 201)));
examPapersRouter.put("/:id", staff, validate({ params: paperIdSchema, body: paperBodySchema }),
  asyncHandler(async (req, res) => send(res, await updateExamPaper(id(req), validatedBody<PaperBody>(req), actorId(req)))));
examPapersRouter.delete("/:id", staff, validate({ params: paperIdSchema }),
  asyncHandler(async (req, res) => send(res, await deleteExamPaper(id(req), actorId(req)))));
