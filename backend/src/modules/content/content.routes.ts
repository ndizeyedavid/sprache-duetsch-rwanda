import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { ACADEMIC_ROLES } from "../../lib/roles.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./content.controller.js";
import {
  createActivitySchema,
  createLessonSchema,
  createMaterialSchema,
  createModuleSchema,
  idParamsSchema,
  levelIdParamsSchema,
  myNotesQuerySchema,
  searchQuerySchema,
  updateActivitySchema,
  updateLessonSchema,
  updateMaterialSchema,
  updateModuleSchema,
  updateProgressSchema,
} from "./content.schema.js";

export const contentRouter = Router();

// ---------------------------------------------------------------------------
// Staff / teacher CMS (academic roles; teachers limited to their own levels)
// ---------------------------------------------------------------------------

contentRouter.post(
  "/levels/:levelId/modules",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ params: levelIdParamsSchema, body: createModuleSchema }),
  asyncHandler(controller.createModule),
);

contentRouter.get(
  "/levels/:levelId/modules",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ params: levelIdParamsSchema }),
  asyncHandler(controller.listModules),
);

contentRouter.patch(
  "/modules/:id",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ params: idParamsSchema, body: updateModuleSchema }),
  asyncHandler(controller.updateModule),
);

contentRouter.delete(
  "/modules/:id",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ params: idParamsSchema }),
  asyncHandler(controller.deleteModule),
);

contentRouter.post(
  "/modules/:id/lessons",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ params: idParamsSchema, body: createLessonSchema }),
  asyncHandler(controller.createLesson),
);

contentRouter.get(
  "/lessons/:id",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ params: idParamsSchema }),
  asyncHandler(controller.getLesson),
);

contentRouter.patch(
  "/lessons/:id",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ params: idParamsSchema, body: updateLessonSchema }),
  asyncHandler(controller.updateLesson),
);

contentRouter.delete(
  "/lessons/:id",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ params: idParamsSchema }),
  asyncHandler(controller.deleteLesson),
);

contentRouter.post(
  "/lessons/:id/materials",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ params: idParamsSchema, body: createMaterialSchema }),
  asyncHandler(controller.createMaterial),
);

contentRouter.patch(
  "/materials/:id",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ params: idParamsSchema, body: updateMaterialSchema }),
  asyncHandler(controller.updateMaterial),
);

contentRouter.delete(
  "/materials/:id",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ params: idParamsSchema }),
  asyncHandler(controller.deleteMaterial),
);

contentRouter.post(
  "/lessons/:id/activities",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ params: idParamsSchema, body: createActivitySchema }),
  asyncHandler(controller.createActivity),
);

contentRouter.patch(
  "/activities/:id",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ params: idParamsSchema, body: updateActivitySchema }),
  asyncHandler(controller.updateActivity),
);

contentRouter.delete(
  "/activities/:id",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ params: idParamsSchema }),
  asyncHandler(controller.deleteActivity),
);

// ---------------------------------------------------------------------------
// Student learning views (access-gated)
// ---------------------------------------------------------------------------

contentRouter.get(
  "/my/courses",
  requireAuth,
  requireRole("STUDENT"),
  asyncHandler(controller.myCourses),
);

contentRouter.get(
  "/my/lessons/:id",
  requireAuth,
  requireRole("STUDENT"),
  validate({ params: idParamsSchema }),
  asyncHandler(controller.myLesson),
);

contentRouter.post(
  "/my/lessons/:id/progress",
  requireAuth,
  requireRole("STUDENT"),
  validate({ params: idParamsSchema, body: updateProgressSchema }),
  asyncHandler(controller.updateProgress),
);

contentRouter.get(
  "/my/notes",
  requireAuth,
  requireRole("STUDENT"),
  validate({ query: myNotesQuerySchema }),
  asyncHandler(controller.myNotes),
);

// ---------------------------------------------------------------------------
// Search (all authenticated roles; students scoped to their levels)
// ---------------------------------------------------------------------------

contentRouter.get(
  "/search",
  requireAuth,
  validate({ query: searchQuerySchema }),
  asyncHandler(controller.search),
);
