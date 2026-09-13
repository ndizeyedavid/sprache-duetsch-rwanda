import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { ADMIN_ROLES } from "../../lib/roles.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./users.controller.js";
import {
  createUserSchema,
  listUserQuerySchema,
  resetUserPasswordSchema,
  updateUserRoleSchema,
  updateUserSchema,
  userIdSchema,
} from "./users.schema.js";

export const usersRouter = Router();

usersRouter.get(
  "/",
  requireAuth,
  requireRole(...ADMIN_ROLES),
  validate({ query: listUserQuerySchema }),
  asyncHandler(controller.list),
);

// Declared before "/:id" so the literal segment is not swallowed by the param route.
// Any signed-in user may see the teacher directory (students need it to know who teaches them).
usersRouter.get("/teachers", requireAuth, asyncHandler(controller.listTeachers));

usersRouter.get(
  "/:id",
  requireAuth,
  requireRole(...ADMIN_ROLES),
  validate({ params: userIdSchema }),
  asyncHandler(controller.get),
);

usersRouter.post(
  "/",
  requireAuth,
  requireRole(...ADMIN_ROLES),
  validate({ body: createUserSchema }),
  asyncHandler(controller.create),
);

usersRouter.patch(
  "/:id",
  requireAuth,
  requireRole(...ADMIN_ROLES),
  validate({ params: userIdSchema, body: updateUserSchema }),
  asyncHandler(controller.update),
);

usersRouter.patch(
  "/:id/role",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  validate({ params: userIdSchema, body: updateUserRoleSchema }),
  asyncHandler(controller.updateRole),
);

usersRouter.post(
  "/:id/reset-password",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  validate({ params: userIdSchema, body: resetUserPasswordSchema }),
  asyncHandler(controller.resetPassword),
);
