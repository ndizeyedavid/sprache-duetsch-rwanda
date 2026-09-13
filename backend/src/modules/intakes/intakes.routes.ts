import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { ADMIN_ROLES } from "../../lib/roles.js";
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
intakesRouter.get("/", validate({ query: listIntakeQuerySchema }), asyncHandler(controller.list));
intakesRouter.get("/:id", validate({ params: intakeIdSchema }), asyncHandler(controller.get));

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
