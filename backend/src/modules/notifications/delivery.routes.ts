import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { emailAvailable,retryDelivery } from "../../lib/notification-delivery.js";
import { prisma } from "../../lib/prisma.js";
import { idParam } from "../../lib/query.js";
import { validatedParams } from "../../lib/request.js";
import { requireRole } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";

export const deliveryRouter = Router();
deliveryRouter.use(requireRole("SUPER_ADMIN", "ACADEMIC_ADMIN"));
deliveryRouter.get("/", asyncHandler(async (_req, res) => {
  const deliveries = await prisma.notificationDelivery.findMany({ where: { status: { in: ["FAILED", "PENDING", "SENDING"] } },
    orderBy: { createdAt: "desc" }, take: 100, select: { id: true, userId: true, email: true, status: true, attempts: true, lastError: true, createdAt: true, nextAttemptAt: true } });
  res.json({ success: true, data: { emailConfigured: emailAvailable(), deliveries } });
}));
deliveryRouter.post("/:id/retry", validate({ params: idParam }), asyncHandler(async (req, res) => {
  const { id } = validatedParams<{ id: string }>(req);
  const row = await retryDelivery(id, req.user?.id);
  res.json({ success: true, data: { id: row.id, status: row.status } });
}));
