import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { ACADEMIC_ROLES, STAFF_ROLES } from "../../lib/roles.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./sessions.controller.js";
import {
  attendanceRecordIdSchema,
  attendanceSummaryQuerySchema,
  cancelSessionSchema,
  createSessionMaterialSchema,
  createSessionSchema,
  listSessionsQuerySchema,
  markAttendanceSchema,
  materialIdSchema,
  rescheduleSessionSchema,
  sessionIdSchema,
  studentSessionsQuerySchema,
  updateAttendanceSchema,
  updateSessionSchema,
} from "./sessions.schema.js";

export const sessionsRouter = Router();

// Student self-service views (registered before "/:id" so "me" is never an id).
sessionsRouter.get(
  "/me/upcoming",
  requireAuth,
  requireRole("STUDENT"),
  asyncHandler(controller.myUpcoming),
);
sessionsRouter.get(
  "/me",
  requireAuth,
  requireRole("STUDENT"),
  validate({ query: studentSessionsQuerySchema }),
  asyncHandler(controller.mySessions),
);
sessionsRouter.get(
  "/me/:id",
  requireAuth,
  requireRole("STUDENT"),
  validate({ params: sessionIdSchema }),
  asyncHandler(controller.mySession),
);

// Staff views.
sessionsRouter.get(
  "/",
  requireAuth,
  requireRole(...STAFF_ROLES),
  validate({ query: listSessionsQuerySchema }),
  asyncHandler(controller.list),
);

sessionsRouter.post(
  "/",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ body: createSessionSchema }),
  asyncHandler(controller.create),
);

sessionsRouter.delete(
  "/materials/:materialId",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ params: materialIdSchema }),
  asyncHandler(controller.deleteMaterial),
);

sessionsRouter.get(
  "/:id",
  requireAuth,
  requireRole(...STAFF_ROLES),
  validate({ params: sessionIdSchema }),
  asyncHandler(controller.get),
);

sessionsRouter.patch(
  "/:id",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ params: sessionIdSchema, body: updateSessionSchema }),
  asyncHandler(controller.update),
);

sessionsRouter.post(
  "/:id/cancel",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ params: sessionIdSchema, body: cancelSessionSchema }),
  asyncHandler(controller.cancel),
);

sessionsRouter.post(
  "/:id/reschedule",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ params: sessionIdSchema, body: rescheduleSessionSchema }),
  asyncHandler(controller.reschedule),
);

sessionsRouter.post(
  "/:id/materials",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ params: sessionIdSchema, body: createSessionMaterialSchema }),
  asyncHandler(controller.addMaterial),
);

sessionsRouter.get(
  "/:id/roster",
  requireAuth,
  requireRole(...STAFF_ROLES),
  validate({ params: sessionIdSchema }),
  asyncHandler(controller.roster),
);

sessionsRouter.post(
  "/:id/attendance",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ params: sessionIdSchema, body: markAttendanceSchema }),
  asyncHandler(controller.markAttendance),
);

sessionsRouter.patch(
  "/attendance/:id",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ params: attendanceRecordIdSchema, body: updateAttendanceSchema }),
  asyncHandler(controller.updateAttendanceRecord),
);

export const attendanceRouter = Router();

attendanceRouter.get(
  "/summary",
  requireAuth,
  requireRole(...STAFF_ROLES, "STUDENT"),
  validate({ query: attendanceSummaryQuerySchema }),
  asyncHandler(controller.attendanceSummary),
);

attendanceRouter.get(
  "/export",
  requireAuth,
  requireRole(...STAFF_ROLES),
  validate({ query: attendanceSummaryQuerySchema }),
  asyncHandler(controller.exportAttendanceCsv),
);

attendanceRouter.get(
  "/me",
  requireAuth,
  requireRole("STUDENT"),
  asyncHandler(controller.myAttendance),
);
