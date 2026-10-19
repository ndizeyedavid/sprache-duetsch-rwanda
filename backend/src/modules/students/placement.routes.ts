import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { idParam } from "../../lib/query.js";
import { ADMIN_ROLES } from "../../lib/roles.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./placement.controller.js";
import {
manualPlacementSchema,
placementDecisionSchema,
placementDraftSchema,
placementQueueQuerySchema,
placementResultParamsSchema,
placementSubmitSchema,
} from "./placement.schema.js";

/** Placement test + decisions. Mounted inside studentsRouter before "/:id". */
export const placementRouter = Router();
const student = [requireAuth, requireRole("STUDENT")];
const academicAdmin = [requireAuth, requireRole(...ADMIN_ROLES)];

// Student self-service (works for PENDING students with no enrolment or payment).
placementRouter.get("/me/placement", student, asyncHandler(controller.mine));
placementRouter.post("/me/placement/start", student, asyncHandler(controller.start));
placementRouter.put(
  "/me/placement/attempts/:id/draft",
  student,
  validate({ params: idParam, body: placementDraftSchema }),
  asyncHandler(controller.saveDraft),
);
placementRouter.post(
  "/me/placement/attempts/:id/submit",
  student,
  validate({ params: idParam, body: placementSubmitSchema }),
  asyncHandler(controller.submit),
);

// Academic admin + super admin: review queue, history, manual entry and decisions.
placementRouter.get("/placements/queue", academicAdmin, validate({ query: placementQueueQuerySchema }), asyncHandler(controller.queue));
placementRouter.get("/:id/placements", academicAdmin, validate({ params: idParam }), asyncHandler(controller.history));
placementRouter.post(
  "/:id/placement",
  academicAdmin,
  validate({ params: idParam, body: manualPlacementSchema }),
  asyncHandler(controller.manual),
);
placementRouter.post(
  "/:id/placements/:resultId/decision",
  academicAdmin,
  validate({ params: placementResultParamsSchema, body: placementDecisionSchema }),
  asyncHandler(controller.decide),
);
