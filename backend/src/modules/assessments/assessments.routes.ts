import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { ACADEMIC_ROLES } from "../../lib/roles.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./assessments.controller.js";
import {
  assessmentIdSchema,
  createAssessmentSchema,
  createQuestionSchema,
  gradeAttemptSchema,
  listAssessmentQuerySchema,
  listAttemptQuerySchema,
  listQuestionQuerySchema,
  myAssessmentsQuerySchema,
  replaceAssessmentQuestionsSchema,
  submitAttemptSchema,
  updateAssessmentSchema,
  updateQuestionSchema,
} from "./assessments.schema.js";

export const assessmentsRouter = Router();

const academic = requireRole(...ACADEMIC_ROLES);

// ---------------------------------------------------------------------------
// Student routes (declared first so /my/* can never be shadowed)
// ---------------------------------------------------------------------------

assessmentsRouter.get(
  "/my/assessments",
  requireAuth,
  requireRole("STUDENT"),
  validate({ query: myAssessmentsQuerySchema }),
  asyncHandler(controller.listMyAssessments),
);

assessmentsRouter.get(
  "/my/assessments/:id",
  requireAuth,
  requireRole("STUDENT"),
  validate({ params: assessmentIdSchema }),
  asyncHandler(controller.getMyAssessment),
);

assessmentsRouter.post(
  "/my/assessments/:id/attempts",
  requireAuth,
  requireRole("STUDENT"),
  validate({ params: assessmentIdSchema }),
  asyncHandler(controller.startAttempt),
);

assessmentsRouter.post(
  "/my/attempts/:id/submit",
  requireAuth,
  requireRole("STUDENT"),
  validate({ params: assessmentIdSchema, body: submitAttemptSchema }),
  asyncHandler(controller.submitAttempt),
);

assessmentsRouter.get(
  "/my/attempts",
  requireAuth,
  requireRole("STUDENT"),
  asyncHandler(controller.listMyAttempts),
);

assessmentsRouter.get(
  "/my/attempts/:id",
  requireAuth,
  requireRole("STUDENT"),
  validate({ params: assessmentIdSchema }),
  asyncHandler(controller.getMyAttempt),
);

// ---------------------------------------------------------------------------
// Question bank (academic staff)
// ---------------------------------------------------------------------------

assessmentsRouter.post(
  "/questions",
  requireAuth,
  academic,
  validate({ body: createQuestionSchema }),
  asyncHandler(controller.createQuestion),
);

assessmentsRouter.get(
  "/questions",
  requireAuth,
  academic,
  validate({ query: listQuestionQuerySchema }),
  asyncHandler(controller.listQuestions),
);

assessmentsRouter.get(
  "/questions/:id",
  requireAuth,
  academic,
  validate({ params: assessmentIdSchema }),
  asyncHandler(controller.getQuestion),
);

assessmentsRouter.patch(
  "/questions/:id",
  requireAuth,
  academic,
  validate({ params: assessmentIdSchema, body: updateQuestionSchema }),
  asyncHandler(controller.updateQuestion),
);

assessmentsRouter.delete(
  "/questions/:id",
  requireAuth,
  academic,
  validate({ params: assessmentIdSchema }),
  asyncHandler(controller.deleteQuestion),
);

// ---------------------------------------------------------------------------
// Assessments (academic staff)
// ---------------------------------------------------------------------------

assessmentsRouter.post(
  "/assessments",
  requireAuth,
  academic,
  validate({ body: createAssessmentSchema }),
  asyncHandler(controller.createAssessment),
);

assessmentsRouter.get(
  "/assessments",
  requireAuth,
  academic,
  validate({ query: listAssessmentQuerySchema }),
  asyncHandler(controller.listAssessments),
);

assessmentsRouter.get(
  "/assessments/:id",
  requireAuth,
  academic,
  validate({ params: assessmentIdSchema }),
  asyncHandler(controller.getAssessment),
);

assessmentsRouter.patch(
  "/assessments/:id",
  requireAuth,
  academic,
  validate({ params: assessmentIdSchema, body: updateAssessmentSchema }),
  asyncHandler(controller.updateAssessment),
);

assessmentsRouter.delete(
  "/assessments/:id",
  requireAuth,
  academic,
  validate({ params: assessmentIdSchema }),
  asyncHandler(controller.deleteAssessment),
);

assessmentsRouter.put(
  "/assessments/:id/questions",
  requireAuth,
  academic,
  validate({ params: assessmentIdSchema, body: replaceAssessmentQuestionsSchema }),
  asyncHandler(controller.replaceAssessmentQuestions),
);

// ---------------------------------------------------------------------------
// Attempts (academic staff)
// ---------------------------------------------------------------------------

assessmentsRouter.get(
  "/attempts",
  requireAuth,
  academic,
  validate({ query: listAttemptQuerySchema }),
  asyncHandler(controller.listAttempts),
);

assessmentsRouter.post(
  "/attempts/:id/grade",
  requireAuth,
  academic,
  validate({ params: assessmentIdSchema, body: gradeAttemptSchema }),
  asyncHandler(controller.gradeAttempt),
);
