import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { ADMIN_ROLES, STAFF_ROLES } from "../../lib/roles.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./enrollments.controller.js";
import {
  createEnrollmentSchema,
  enrollmentIdSchema,
  listEnrollmentsQuerySchema,
  updateEnrollmentSchema,
} from "./enrollments.schema.js";

export const enrollmentsRouter = Router();

enrollmentsRouter.get("/me", requireAuth, requireRole("STUDENT"), asyncHandler(controller.me));

enrollmentsRouter.get(
  "/",
  requireAuth,
  requireRole(...STAFF_ROLES),
  validate({ query: listEnrollmentsQuerySchema }),
  asyncHandler(controller.list),
);

enrollmentsRouter.get(
  "/:id",
  requireAuth,
  requireRole(...STAFF_ROLES),
  validate({ params: enrollmentIdSchema }),
  asyncHandler(controller.get),
);

enrollmentsRouter.post(
  "/",
  requireAuth,
  requireRole(...ADMIN_ROLES),
  validate({ body: createEnrollmentSchema }),
  asyncHandler(controller.create),
);

enrollmentsRouter.patch(
  "/:id",
  requireAuth,
  requireRole(...ADMIN_ROLES),
  validate({ params: enrollmentIdSchema, body: updateEnrollmentSchema }),
  asyncHandler(controller.update),
);
