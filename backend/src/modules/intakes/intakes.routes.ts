import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { ADMIN_ROLES,STAFF_ROLES } from "../../lib/roles.js";
import { catalogueAccess } from "../../middleware/catalogue-access.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./intakes.controller.js";
import {
createIntakeSchema,
intakeIdSchema,
listIntakeQuerySchema,
updateIntakeSchema,
} from "./intakes.schema.js";

export const intakesRouter = Router();

// Public: the registration form needs the list of open intakes.
intakesRouter.get("/", catalogueAccess, validate({ query: listIntakeQuerySchema }), asyncHandler(controller.list));
// Staff intake switcher (before "/:id"): phase, counts and — for finance roles — money totals.
intakesRouter.get("/overview", requireAuth, requireRole(...STAFF_ROLES), asyncHandler(controller.overview));
intakesRouter.get("/:id", catalogueAccess, validate({ params: intakeIdSchema }), asyncHandler(controller.get));

intakesRouter.post(
  "/",
  requireAuth,
  requireRole(...ADMIN_ROLES),
  validate({ body: createIntakeSchema }),
  asyncHandler(controller.create),
);

intakesRouter.patch(
  "/:id",
  requireAuth,
  requireRole(...ADMIN_ROLES),
  validate({ params: intakeIdSchema, body: updateIntakeSchema }),
  asyncHandler(controller.update),
);

intakesRouter.delete(
  "/:id",
  requireAuth,
  requireRole(...ADMIN_ROLES),
  validate({ params: intakeIdSchema }),
  asyncHandler(controller.remove),
);
