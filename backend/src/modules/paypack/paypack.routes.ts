import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { asyncHandler } from "../../lib/async-handler.js";
import { idParam } from "../../lib/query.js";
import { FINANCE_ROLES } from "../../lib/roles.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./paypack.controller.js";
import { checkoutSchema } from "./paypack.schema.js";

export const paypackRouter = Router();
paypackRouter.use(requireAuth, requireRole("STUDENT", ...FINANCE_ROLES));
paypackRouter.get("/config", asyncHandler(controller.config));
paypackRouter.get("/me", requireRole("STUDENT"), asyncHandler(controller.listMine));
paypackRouter.post("/checkout", requireRole("STUDENT"), rateLimit({ windowMs: 60000, limit: 5 }),
  validate({ body: checkoutSchema }), asyncHandler(controller.checkout));
paypackRouter.get("/", requireRole(...FINANCE_ROLES), asyncHandler(controller.list));
paypackRouter.get("/:id", validate({ params: idParam }), asyncHandler(controller.get));
paypackRouter.post("/:id/reconcile", requireRole(...FINANCE_ROLES), validate({ params: idParam,
  body: z.object({ reference: z.string().trim().min(1).max(200), reason: z.string().trim().min(5).max(500) }).strict() }),
  asyncHandler(controller.reconcile));
paypackRouter.post("/:id/close", requireRole(...FINANCE_ROLES), validate({ params: idParam,
  body: z.object({ confirmedNoDebit: z.literal(true), reason: z.string().trim().min(10).max(500) }).strict() }),
  asyncHandler(controller.close));
