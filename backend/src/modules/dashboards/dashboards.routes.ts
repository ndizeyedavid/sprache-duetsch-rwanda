import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { ACADEMIC_ROLES, ADMIN_ROLES, FINANCE_ROLES } from "../../lib/roles.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./dashboards.controller.js";
import { dashboardFilterSchema } from "./dashboards.schema.js";

export const dashboardsRouter = Router();

dashboardsRouter.use(requireAuth);

dashboardsRouter.get(
  "/student",
  requireRole("STUDENT"),
  validate({ query: dashboardFilterSchema }),
  asyncHandler(controller.student),
);

dashboardsRouter.get(
  "/teacher",
  requireRole(...ACADEMIC_ROLES),
  validate({ query: dashboardFilterSchema }),
  asyncHandler(controller.teacher),
);

dashboardsRouter.get(
  "/academic",
  requireRole(...ADMIN_ROLES),
  validate({ query: dashboardFilterSchema }),
  asyncHandler(controller.academic),
);

dashboardsRouter.get(
  "/finance",
  requireRole(...FINANCE_ROLES),
  validate({ query: dashboardFilterSchema }),
  asyncHandler(controller.finance),
);

dashboardsRouter.get(
  "/management",
  requireRole("SUPER_ADMIN"),
  validate({ query: dashboardFilterSchema }),
  asyncHandler(controller.management),
);
