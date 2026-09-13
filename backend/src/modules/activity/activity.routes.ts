import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { ACADEMIC_ROLES, ADMIN_ROLES } from "../../lib/roles.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./activity.controller.js";
import { createEventSchema, eventIdSchema, listFeedQuerySchema } from "./activity.schema.js";

export const activityRouter = Router();

activityRouter.use(requireAuth);

activityRouter.get("/feed", validate({ query: listFeedQuerySchema }), asyncHandler(controller.feed));

activityRouter.post(
  "/events",
  requireRole(...ACADEMIC_ROLES),
  validate({ body: createEventSchema }),
  asyncHandler(controller.create),
);

activityRouter.delete(
  "/events/:id",
  requireRole(...ADMIN_ROLES),
  validate({ params: eventIdSchema }),
  asyncHandler(controller.remove),
);
