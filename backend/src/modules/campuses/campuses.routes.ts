import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { ADMIN_ROLES } from "../../lib/roles.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./campuses.controller.js";
import { campusIdSchema, createCampusSchema, listCampusQuerySchema, updateCampusSchema } from "./campuses.schema.js";

export const campusesRouter = Router();

// Public: the registration form needs the list of active campuses.
campusesRouter.get("/", validate({ query: listCampusQuerySchema }), asyncHandler(controller.list));
campusesRouter.get("/:id", validate({ params: campusIdSchema }), asyncHandler(controller.get));

campusesRouter.post(
  "/",
  requireAuth,
  requireRole(...ADMIN_ROLES),
  validate({ body: createCampusSchema }),
  asyncHandler(controller.create),
);

campusesRouter.patch(
  "/:id",
  requireAuth,
  requireRole(...ADMIN_ROLES),
  validate({ params: campusIdSchema, body: updateCampusSchema }),
  asyncHandler(controller.update),
);
