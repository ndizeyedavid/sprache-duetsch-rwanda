import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { ACADEMIC_ROLES } from "../../lib/roles.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./notifications.controller.js";
import {
  createAnnouncementSchema,
  listNotificationQuerySchema,
  notificationIdSchema,
} from "./notifications.schema.js";

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get(
  "/",
  validate({ query: listNotificationQuerySchema }),
  asyncHandler(controller.list),
);

notificationsRouter.get("/unread-count", asyncHandler(controller.unreadCount));

notificationsRouter.post("/read-all", asyncHandler(controller.readAll));

notificationsRouter.post(
  "/announcements",
  requireRole(...ACADEMIC_ROLES),
  validate({ body: createAnnouncementSchema }),
  asyncHandler(controller.announce),
);

notificationsRouter.patch(
  "/:id/read",
  validate({ params: notificationIdSchema }),
  asyncHandler(controller.markRead),
);

notificationsRouter.delete(
  "/:id",
  validate({ params: notificationIdSchema }),
  asyncHandler(controller.remove),
);
