import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { ACADEMIC_ROLES, ADMIN_ROLES, STAFF_ROLES } from "../../lib/roles.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./students.controller.js";
import { listStudentsQuerySchema, placementSchema, studentIdSchema, updateStudentSchema } from "./students.schema.js";

export const studentsRouter = Router();

// Student self-service views (registered before "/:id" so "me" is never treated as an id).
studentsRouter.get("/me", requireAuth, requireRole("STUDENT"), asyncHandler(controller.me));
studentsRouter.get(
  "/me/attendance",
  requireAuth,
  requireRole("STUDENT"),
  asyncHandler(controller.myAttendance),
);
studentsRouter.get(
  "/me/progress",
  requireAuth,
  requireRole("STUDENT"),
  asyncHandler(controller.myProgress),
);

studentsRouter.get(
  "/",
  requireAuth,
  requireRole(...STAFF_ROLES),
  validate({ query: listStudentsQuerySchema }),
  asyncHandler(controller.list),
);

studentsRouter.get(
  "/:id",
  requireAuth,
  requireRole(...STAFF_ROLES),
  validate({ params: studentIdSchema }),
  asyncHandler(controller.get),
);

studentsRouter.patch(
  "/:id",
  requireAuth,
  requireRole(...ADMIN_ROLES),
  validate({ params: studentIdSchema, body: updateStudentSchema }),
  asyncHandler(controller.update),
);

studentsRouter.post(
  "/:id/placement",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ params: studentIdSchema, body: placementSchema }),
  asyncHandler(controller.placement),
);
