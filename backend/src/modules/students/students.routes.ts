import { z } from "zod";
import { validatedBody,validatedParams } from "../../lib/request.js";
import { reinstateStudent,suspendStudent } from "./suspend-student.js";
import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { ADMIN_ROLES,STAFF_ROLES } from "../../lib/roles.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./students.controller.js";
import { placementRouter } from "./placement.routes.js";
import { listStudentsQuerySchema,studentIdSchema,updateStudentSchema } from "./students.schema.js";

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
studentsRouter.get("/me/people", requireAuth, requireRole("STUDENT"), asyncHandler(controller.myPeople));
// Placement test, review queue and decisions (also before "/:id").
studentsRouter.use(placementRouter);

studentsRouter.get(
  "/",
  requireAuth,
  requireRole(...STAFF_ROLES),
  validate({ query: listStudentsQuerySchema }),
  asyncHandler(controller.list),
);

studentsRouter.get(
  "/export",
  requireAuth,
  requireRole(...STAFF_ROLES),
  validate({ query: listStudentsQuerySchema }),
  asyncHandler(controller.exportCsv),
);

studentsRouter.get(
  "/:id",
  requireAuth,
  requireRole(...STAFF_ROLES),
  validate({ params: studentIdSchema }),
  asyncHandler(controller.get),
);

// Lesson progress and per-session attendance: academic records, so no Finance Admin.
studentsRouter.get(
  "/:id/progress",
  requireAuth,
  requireRole(...ADMIN_ROLES),
  validate({ params: studentIdSchema }),
  asyncHandler(controller.progress),
);

studentsRouter.get(
  "/:id/attendance",
  requireAuth,
  requireRole(...ADMIN_ROLES),
  validate({ params: studentIdSchema }),
  asyncHandler(controller.attendance),
);

studentsRouter.patch(
  "/:id",
  requireAuth,
  requireRole(...ADMIN_ROLES),
  validate({ params: studentIdSchema, body: updateStudentSchema }),
  asyncHandler(controller.update),
);

const suspendBody = z.object({ reason: z.string().trim().min(5, "Give a short reason the student will see").max(500) });
studentsRouter.post("/:id/suspend", requireAuth, requireRole(...ADMIN_ROLES), validate({ params: studentIdSchema, body: suspendBody }),
  asyncHandler(async (req, res) => {
    const { id } = validatedParams<{ id: string }>(req);
    res.json({ success: true, data: await suspendStudent(id, validatedBody<{ reason: string }>(req).reason, req.user!.id) });
  }));
studentsRouter.post("/:id/reinstate", requireAuth, requireRole(...ADMIN_ROLES), validate({ params: studentIdSchema }),
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await reinstateStudent(validatedParams<{ id: string }>(req).id, req.user!.id) });
  }));
