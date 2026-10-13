import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { ACADEMIC_ROLES } from "../../lib/roles.js";
import { requireRole } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import * as c from "./feedback-bank.controller.js";
import { bankParams, feedbackCommentBody, rubricTemplateBody } from "./feedback-bank.schema.js";

/** Rubric templates and saved feedback comments. Mounted at /api/assignments/bank (auth applied by the parent). */
export const feedbackBankRouter = Router();
feedbackBankRouter.use(requireRole(...ACADEMIC_ROLES));

feedbackBankRouter.get("/rubrics", asyncHandler(c.listRubrics));
feedbackBankRouter.post("/rubrics", validate({ body: rubricTemplateBody }), asyncHandler(c.createRubric));
feedbackBankRouter.put("/rubrics/:id", validate({ params: bankParams, body: rubricTemplateBody }), asyncHandler(c.updateRubric));
feedbackBankRouter.delete("/rubrics/:id", validate({ params: bankParams }), asyncHandler(c.deleteRubric));

feedbackBankRouter.get("/comments", asyncHandler(c.listComments));
feedbackBankRouter.post("/comments", validate({ body: feedbackCommentBody }), asyncHandler(c.createComment));
feedbackBankRouter.put("/comments/:id", validate({ params: bankParams, body: feedbackCommentBody }), asyncHandler(c.updateComment));
feedbackBankRouter.delete("/comments/:id", validate({ params: bankParams }), asyncHandler(c.deleteComment));
feedbackBankRouter.post("/comments/:id/use", validate({ params: bankParams }), asyncHandler(c.useComment));
