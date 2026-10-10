import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { ACADEMIC_ROLES,ADMIN_ROLES } from "../../lib/roles.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./classes.controller.js";
import {
classIdSchema,
createClassSchema,
listClassQuerySchema,
updateClassSchema,
} from "./classes.schema.js";

export const classesRouter = Router();

classesRouter.get(
  "/",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ query: listClassQuerySchema }),
  asyncHandler(controller.list),
);

classesRouter.get(
  "/:id",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ params: classIdSchema }),
  asyncHandler(controller.get),
);

classesRouter.post(
  "/",
  requireAuth,
  requireRole(...ADMIN_ROLES),
  validate({ body: createClassSchema }),
  asyncHandler(controller.create),
);

classesRouter.patch(
  "/:id",
  requireAuth,
  requireRole(...ADMIN_ROLES),
  validate({ params: classIdSchema, body: updateClassSchema }),
  asyncHandler(controller.update),
);

classesRouter.delete(
  "/:id",
  requireAuth,
  requireRole(...ADMIN_ROLES),
  validate({ params: classIdSchema }),
  asyncHandler(controller.remove),
);
