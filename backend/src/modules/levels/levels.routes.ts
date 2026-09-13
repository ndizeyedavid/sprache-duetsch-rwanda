import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { ADMIN_ROLES } from "../../lib/roles.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./levels.controller.js";
import {
  createLevelSchema,
  levelIdSchema,
  listLevelQuerySchema,
  updateLevelSchema,
} from "./levels.schema.js";

export const levelsRouter = Router();

// Public: registration and course pages need the level catalogue.
levelsRouter.get("/", validate({ query: listLevelQuerySchema }), asyncHandler(controller.list));
levelsRouter.get("/:id", validate({ params: levelIdSchema }), asyncHandler(controller.get));

levelsRouter.post(
  "/",
  requireAuth,
  requireRole(...ADMIN_ROLES),
  validate({ body: createLevelSchema }),
  asyncHandler(controller.create),
);

levelsRouter.patch(
  "/:id",
  requireAuth,
  requireRole(...ADMIN_ROLES),
  validate({ params: levelIdSchema, body: updateLevelSchema }),
  asyncHandler(controller.update),
);

levelsRouter.delete(
  "/:id",
  requireAuth,
  requireRole(...ADMIN_ROLES),
  validate({ params: levelIdSchema }),
  asyncHandler(controller.remove),
);
