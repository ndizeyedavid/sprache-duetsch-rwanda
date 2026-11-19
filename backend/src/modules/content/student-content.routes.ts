import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import { uploadActivityFile } from "./activity-file.controller.js";
import * as controller from "./content.controller.js";
import {
idParamsSchema,
myNotesQuerySchema,
reviewParamsSchema,
saveReviewSchema,
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
  "/my/review/:levelId",
  requireAuth,
  requireRole("STUDENT"),
  validate({ params: reviewParamsSchema }),
  asyncHandler(controller.myReview),
);
studentContentRouter.post(
  "/my/review/:levelId",
  requireAuth,
  requireRole("STUDENT"),
  validate({ params: reviewParamsSchema, body: saveReviewSchema }),
  asyncHandler(controller.saveMyReview),
);
studentContentRouter.get(
  "/my/levels/:levelId/words",
  requireAuth,
  requireRole("STUDENT"),
  validate({ params: reviewParamsSchema }),
  asyncHandler(controller.myWordList),
);
studentContentRouter.get(
  "/my/progress",
  requireAuth,
  requireRole("STUDENT"),
  asyncHandler(controller.myProgress),
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
studentContentRouter.post(
  "/activities/:id/files",
  requireAuth,
  requireRole("STUDENT"),
  validate({ params: idParamsSchema }),
  uploadActivityFile,
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
