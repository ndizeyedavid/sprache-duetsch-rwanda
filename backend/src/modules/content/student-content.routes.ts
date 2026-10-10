import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./content.controller.js";
import {
idParamsSchema,
myNotesQuerySchema,
submitActivitySchema,
updateProgressSchema
} from "./content.schema.js";
export const studentContentRouter = Router();
studentContentRouter.get(
  "/my/courses",
  requireAuth,
  requireRole("STUDENT"),
  asyncHandler(controller.myCourses),
);
studentContentRouter.get(
  "/my/lessons/:id",
  requireAuth,
  requireRole("STUDENT"),
  validate({ params: idParamsSchema }),
  asyncHandler(controller.myLesson),
);
studentContentRouter.post(
  "/my/lessons/:id/progress",
  requireAuth,
  requireRole("STUDENT"),
  validate({ params: idParamsSchema, body: updateProgressSchema }),
  asyncHandler(controller.updateProgress),
);
studentContentRouter.get(
  "/my/notes",
  requireAuth,
  requireRole("STUDENT"),
  validate({ query: myNotesQuerySchema }),
  asyncHandler(controller.myNotes),
);
studentContentRouter.get(
  "/my/assignments",
  requireAuth,
  requireRole("STUDENT"),
  asyncHandler(controller.myAssignments),
);
studentContentRouter.get(
  "/my/assignments/:id",
  requireAuth,
  requireRole("STUDENT"),
  validate({ params: idParamsSchema }),
  asyncHandler(controller.myAssignmentDetail),
);
studentContentRouter.post(
  "/activities/:id/submit",
  requireAuth,
  requireRole("STUDENT"),
  validate({ params: idParamsSchema, body: submitActivitySchema }),
  asyncHandler(controller.submitActivity),
);
studentContentRouter.get(
  "/activities/:id/my-submission",
  requireAuth,
  requireRole("STUDENT"),
  validate({ params: idParamsSchema }),
  asyncHandler(controller.myActivitySubmission),
);
studentContentRouter.get(
  "/my/activity-submissions",
  requireAuth,
  requireRole("STUDENT"),
  asyncHandler(controller.myActivitySubmissions),
);
