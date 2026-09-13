import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { ADMIN_ROLES, ALL_ROLES, FINANCE_ROLES } from "../../lib/roles.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./payments.controller.js";
import {
  chargeIdSchema,
  createChargeSchema,
  createDiscountSchema,
  createPaymentMethodSchema,
  createPaymentSchema,
  createRefundSchema,
  deleteChargeSchema,
  deletePaymentSchema,
  discountIdSchema,
  financeSummaryQuerySchema,
  listChargesQuerySchema,
  listDiscountsQuerySchema,
  listPaymentMethodQuerySchema,
  listPaymentsQuerySchema,
  listReceiptsQuerySchema,
  myReceiptsQuerySchema,
  outstandingQuerySchema,
  paymentIdSchema,
  paymentMethodIdSchema,
  receiptIdSchema,
  rejectDiscountSchema,
  runRemindersSchema,
  updateChargeSchema,
  updatePaymentMethodSchema,
  updatePaymentSchema,
} from "./payments.schema.js";

export const paymentsRouter = Router();

paymentsRouter.use(requireAuth);

// --- Payment methods ---

paymentsRouter.get(
  "/methods",
  requireRole(...ALL_ROLES),
  validate({ query: listPaymentMethodQuerySchema }),
  asyncHandler(controller.listMethods),
);

paymentsRouter.post(
  "/methods",
  requireRole(...FINANCE_ROLES),
  validate({ body: createPaymentMethodSchema }),
  asyncHandler(controller.createMethod),
);

paymentsRouter.patch(
  "/methods/:id",
  requireRole(...FINANCE_ROLES),
  validate({ params: paymentMethodIdSchema, body: updatePaymentMethodSchema }),
  asyncHandler(controller.updateMethod),
);

paymentsRouter.delete(
  "/methods/:id",
  requireRole(...FINANCE_ROLES),
  validate({ params: paymentMethodIdSchema }),
  asyncHandler(controller.disableMethod),
);

// --- Charges ---

paymentsRouter.get(
  "/charges",
  requireRole(...FINANCE_ROLES),
  validate({ query: listChargesQuerySchema }),
  asyncHandler(controller.listCharges),
);

paymentsRouter.post(
  "/charges",
  requireRole(...FINANCE_ROLES),
  validate({ body: createChargeSchema }),
  asyncHandler(controller.createCharge),
);

paymentsRouter.patch(
  "/charges/:id",
  requireRole(...FINANCE_ROLES),
  validate({ params: chargeIdSchema, body: updateChargeSchema }),
  asyncHandler(controller.updateCharge),
);

paymentsRouter.delete(
  "/charges/:id",
  requireRole(...FINANCE_ROLES),
  validate({ params: chargeIdSchema, body: deleteChargeSchema }),
  asyncHandler(controller.deleteCharge),
);

// --- Discounts ---

paymentsRouter.get(
  "/discounts",
  requireRole(...FINANCE_ROLES),
  validate({ query: listDiscountsQuerySchema }),
  asyncHandler(controller.listDiscounts),
);

paymentsRouter.post(
  "/discounts",
  requireRole(...FINANCE_ROLES),
  validate({ body: createDiscountSchema }),
  asyncHandler(controller.createDiscount),
);

paymentsRouter.post(
  "/discounts/:id/approve",
  requireRole(...FINANCE_ROLES),
  validate({ params: discountIdSchema }),
  asyncHandler(controller.approveDiscount),
);

paymentsRouter.post(
  "/discounts/:id/reject",
  requireRole(...FINANCE_ROLES),
  validate({ params: discountIdSchema, body: rejectDiscountSchema }),
  asyncHandler(controller.rejectDiscount),
);

// --- Payments ---

paymentsRouter.get(
  "/",
  requireRole(...FINANCE_ROLES),
  validate({ query: listPaymentsQuerySchema }),
  asyncHandler(controller.listPayments),
);

paymentsRouter.post(
  "/",
  requireRole(...FINANCE_ROLES),
  validate({ body: createPaymentSchema }),
  asyncHandler(controller.createPayment),
);

paymentsRouter.post(
  "/refunds",
  requireRole(...FINANCE_ROLES),
  validate({ body: createRefundSchema }),
  asyncHandler(controller.createRefund),
);

// --- Receipts ---

paymentsRouter.get(
  "/receipts",
  requireRole(...FINANCE_ROLES),
  validate({ query: listReceiptsQuerySchema }),
  asyncHandler(controller.listReceipts),
);

paymentsRouter.get(
  "/receipts/:id",
  requireRole(...FINANCE_ROLES, "STUDENT"),
  validate({ params: receiptIdSchema }),
  asyncHandler(controller.getReceipt),
);

// --- Student self-service ---

paymentsRouter.get(
  "/me/finance",
  requireRole("STUDENT"),
  asyncHandler(controller.getMyFinance),
);

paymentsRouter.get(
  "/me/receipts",
  requireRole("STUDENT"),
  validate({ query: myReceiptsQuerySchema }),
  asyncHandler(controller.getMyReceipts),
);

// --- Reports ---

paymentsRouter.get(
  "/reports/summary",
  requireRole(...FINANCE_ROLES, ...ADMIN_ROLES),
  validate({ query: financeSummaryQuerySchema }),
  asyncHandler(controller.getSummary),
);

paymentsRouter.get(
  "/reports/outstanding",
  requireRole(...FINANCE_ROLES),
  validate({ query: outstandingQuerySchema }),
  asyncHandler(controller.listOutstanding),
);

// --- Reminders ---

paymentsRouter.post(
  "/reminders/run",
  requireRole(...FINANCE_ROLES),
  validate({ body: runRemindersSchema }),
  asyncHandler(controller.runReminders),
);

// --- Single payment (keep after all literal single-segment paths) ---

paymentsRouter.get(
  "/:id",
  requireRole(...FINANCE_ROLES),
  validate({ params: paymentIdSchema }),
  asyncHandler(controller.getPayment),
);

paymentsRouter.patch(
  "/:id",
  requireRole(...FINANCE_ROLES),
  validate({ params: paymentIdSchema, body: updatePaymentSchema }),
  asyncHandler(controller.updatePayment),
);

paymentsRouter.delete(
  "/:id",
  requireRole(...FINANCE_ROLES),
  validate({ params: paymentIdSchema, body: deletePaymentSchema }),
  asyncHandler(controller.deletePayment),
);
