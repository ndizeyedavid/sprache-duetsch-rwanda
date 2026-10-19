import { Router } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../../lib/async-handler.js";
import { FINANCE_ROLES } from "../../lib/roles.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./payment-claims.controller.js";
import { approveClaimSchema,claimIdParams,listClaimsQuerySchema,rejectClaimSchema,settleBalanceSchema,settleParams,submitClaimSchema } from "./payment-claims.schema.js";

/** Manual payments outside the gateway: student reports + finance approval, and "mark as paid". */
export const paymentClaimsRouter = Router();
paymentClaimsRouter.use(requireAuth);

// Student side
paymentClaimsRouter.get("/claims/my", requireRole("STUDENT"), asyncHandler(controller.mine));
paymentClaimsRouter.post("/claims", requireRole("STUDENT"), rateLimit({ windowMs: 60_000, limit: 5 }),
  validate({ body: submitClaimSchema }), asyncHandler(controller.submit));
paymentClaimsRouter.post("/claims/:id/withdraw", requireRole("STUDENT"), validate({ params: claimIdParams }), asyncHandler(controller.withdraw));

// Finance side (academic admins have no finance access)
paymentClaimsRouter.get("/claims", requireRole(...FINANCE_ROLES), validate({ query: listClaimsQuerySchema }), asyncHandler(controller.list));
paymentClaimsRouter.post("/claims/:id/approve", requireRole(...FINANCE_ROLES), validate({ params: claimIdParams, body: approveClaimSchema }), asyncHandler(controller.approve));
paymentClaimsRouter.post("/claims/:id/reject", requireRole(...FINANCE_ROLES), validate({ params: claimIdParams, body: rejectClaimSchema }), asyncHandler(controller.reject));
paymentClaimsRouter.post("/settle/:studentId", requireRole(...FINANCE_ROLES), validate({ params: settleParams, body: settleBalanceSchema }), asyncHandler(controller.settle));
