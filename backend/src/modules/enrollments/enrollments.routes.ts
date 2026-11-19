import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../lib/async-handler.js";
import { actorId,validatedBody,validatedQuery } from "../../lib/request.js";
import { ADMIN_ROLES,FINANCE_ROLES,STAFF_ROLES } from "../../lib/roles.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./enrollments.controller.js";
import { joinIntake, joinIntakeSchema } from './join-intake.js';
import type { AssignClassInput } from "./assign-class.js";
import { assignClass,assignClassSchema } from "./assign-class.js";
import { enrollmentRegister } from "./enrollment-register.js";
import {
createEnrollmentSchema,
enrollmentIdSchema,
listEnrollmentsQuerySchema,
updateEnrollmentSchema,
} from "./enrollments.schema.js";

export const enrollmentsRouter = Router();

enrollmentsRouter.get("/me", requireAuth, requireRole("STUDENT"), asyncHandler(controller.me));
enrollmentsRouter.post('/join', requireAuth, requireRole('STUDENT'), validate({ body: joinIntakeSchema }), asyncHandler(joinIntake));

// Admin register (every enrolment with access, sign-in and progress) and bulk class placement.
// Declared before "/:id" so these paths are never read as an enrolment id.
const registerQuery = z.object({ intakeId: z.string().uuid().optional() });
enrollmentsRouter.get("/register", requireAuth, requireRole(...ADMIN_ROLES), validate({ query: registerQuery }), asyncHandler(async (req, res) => {
  const { intakeId } = validatedQuery<z.infer<typeof registerQuery>>(req);
  res.json({ success: true, data: await enrollmentRegister({ withMoney: FINANCE_ROLES.includes(req.user!.role), intakeId }) });
}));
enrollmentsRouter.post("/assign-class", requireAuth, requireRole(...ADMIN_ROLES), validate({ body: assignClassSchema }), asyncHandler(async (req, res) => {
  res.json({ success: true, data: await assignClass(validatedBody<AssignClassInput>(req), actorId(req)) });
}));

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
