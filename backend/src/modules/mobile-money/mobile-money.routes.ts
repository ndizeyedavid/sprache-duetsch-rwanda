import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { asyncHandler } from "../../lib/async-handler.js";
import { idParam } from "../../lib/query.js";
import { FINANCE_ROLES } from "../../lib/roles.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./mobile-money.controller.js";
import { checkoutSchema } from "./mobile-money.schema.js";

/** Mobile money (XendlyPay) for students and the finance office. Mounted at /api/payments/mobile-money. */
export const mobileMoneyRouter = Router();
mobileMoneyRouter.use(requireAuth, requireRole("STUDENT", ...FINANCE_ROLES));
mobileMoneyRouter.get("/config", asyncHandler(controller.config));
mobileMoneyRouter.get("/me", requireRole("STUDENT"), asyncHandler(controller.listMine));
mobileMoneyRouter.post("/checkout", requireRole("STUDENT"), rateLimit({ windowMs: 60000, limit: 5 }),
  validate({ body: checkoutSchema }), asyncHandler(controller.checkout));
mobileMoneyRouter.get("/", requireRole(...FINANCE_ROLES), asyncHandler(controller.list));
mobileMoneyRouter.get("/:id", validate({ params: idParam }), asyncHandler(controller.get));
mobileMoneyRouter.post("/:id/reconcile", requireRole(...FINANCE_ROLES), validate({ params: idParam,
  body: z.object({ reference: z.string().trim().min(1).max(200), reason: z.string().trim().min(5).max(500) }).strict() }),
  asyncHandler(controller.reconcile));
mobileMoneyRouter.post("/:id/close", requireRole(...FINANCE_ROLES), validate({ params: idParam,
  body: z.object({ confirmedNoDebit: z.literal(true), reason: z.string().trim().min(10).max(500) }).strict() }),
  asyncHandler(controller.close));
