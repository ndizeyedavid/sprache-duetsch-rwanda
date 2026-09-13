import { z } from "zod";
import { booleanQuery, idParam, optionalText, paginationQuery } from "../../lib/query.js";

export const chargeTypeEnum = z.enum(["TUITION", "REGISTRATION", "BOOKS", "MATERIALS", "OTHER"]);
export const paymentTxnTypeEnum = z.enum(["PAYMENT", "REFUND"]);
export const discountTypeEnum = z.enum(["PERCENTAGE", "FIXED"]);
export const discountStatusEnum = z.enum(["PENDING", "APPROVED", "REJECTED"]);
export const paymentStatusEnum = z.enum([
  "UNPAID",
  "PARTIALLY_PAID",
  "FULLY_PAID",
  "OVERDUE",
  "WAIVED",
  "REFUNDED",
]);

const moneySchema = z.coerce.number().positive();
const reasonSchema = z.string().trim().min(1).max(500);
const currencySchema = z.string().trim().min(1).max(10);

// --- Payment methods (configuration only; never store card data) ---

export const createPaymentMethodSchema = z.object({
  code: z.string().trim().min(2).max(40).toUpperCase(),
  name: z.string().trim().min(2).max(120),
  requiresReference: z.boolean().optional(),
  instructions: optionalText(500),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export const updatePaymentMethodSchema = createPaymentMethodSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field must be provided" },
);

export const listPaymentMethodQuerySchema = z.object({
  isActive: booleanQuery.optional(),
});

export const paymentMethodIdSchema = idParam;

// --- Charges ---

export const createChargeSchema = z.object({
  studentId: z.string().min(1),
  enrollmentId: z.string().min(1).optional(),
  type: chargeTypeEnum,
  description: z.string().trim().min(1).max(240),
  amount: moneySchema,
  dueDate: z.coerce.date().optional(),
  currency: currencySchema.optional(),
});

export const updateChargeSchema = z.object({
  reason: reasonSchema,
  description: z.string().trim().min(1).max(240).optional(),
  amount: moneySchema.optional(),
  dueDate: z.coerce.date().optional(),
});

export const deleteChargeSchema = z.object({ reason: reasonSchema });

export const listChargesQuerySchema = z.object({
  studentId: z.string().min(1).optional(),
  enrollmentId: z.string().min(1).optional(),
  type: chargeTypeEnum.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  ...paginationQuery,
});

export const chargeIdSchema = idParam;

// --- Discounts ---

export const createDiscountSchema = z.object({
  studentId: z.string().min(1),
  enrollmentId: z.string().min(1).optional(),
  type: discountTypeEnum,
  value: moneySchema,
  reason: reasonSchema,
});

export const listDiscountsQuerySchema = z.object({
  studentId: z.string().min(1).optional(),
  status: discountStatusEnum.optional(),
  ...paginationQuery,
});

export const rejectDiscountSchema = z.object({ reason: reasonSchema });

export const discountIdSchema = idParam;

// --- Payments ---

export const createPaymentSchema = z.object({
  studentId: z.string().min(1),
  enrollmentId: z.string().min(1).optional(),
  methodId: z.string().min(1),
  amount: moneySchema,
  reference: optionalText(120),
  paidAt: z.coerce.date().optional(),
  currency: currencySchema.optional(),
  notes: optionalText(500),
});

export const updatePaymentSchema = z.object({
  reason: reasonSchema,
  amount: moneySchema.optional(),
  reference: optionalText(120),
  paidAt: z.coerce.date().optional(),
  notes: optionalText(500),
});

export const deletePaymentSchema = z.object({ reason: reasonSchema });

export const listPaymentsQuerySchema = z.object({
  studentId: z.string().min(1).optional(),
  enrollmentId: z.string().min(1).optional(),
  methodId: z.string().min(1).optional(),
  txnType: paymentTxnTypeEnum.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  ...paginationQuery,
});

export const createRefundSchema = z.object({
  paymentId: z.string().min(1),
  amount: moneySchema,
  reason: reasonSchema,
  methodId: z.string().min(1).optional(),
  notes: optionalText(500),
});

export const paymentIdSchema = idParam;

// --- Receipts ---

export const listReceiptsQuerySchema = z.object({
  studentId: z.string().min(1).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  ...paginationQuery,
});

export const myReceiptsQuerySchema = z.object({
  ...paginationQuery,
});

export const receiptIdSchema = idParam;

// --- Reports ---

export const financeSummaryQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  intakeId: z.string().min(1).optional(),
  levelId: z.string().min(1).optional(),
  campusId: z.string().min(1).optional(),
});

export const outstandingQuerySchema = z.object({
  campusId: z.string().min(1).optional(),
  levelId: z.string().min(1).optional(),
  intakeId: z.string().min(1).optional(),
  ...paginationQuery,
});

// --- Reminders ---

export const runRemindersSchema = z.object({
  overdueOnly: z.boolean().optional(),
});

export type CreatePaymentMethodInput = z.infer<typeof createPaymentMethodSchema>;
export type UpdatePaymentMethodInput = z.infer<typeof updatePaymentMethodSchema>;
export type ListPaymentMethodQuery = z.infer<typeof listPaymentMethodQuerySchema>;

export type CreateChargeInput = z.infer<typeof createChargeSchema>;
export type UpdateChargeInput = z.infer<typeof updateChargeSchema>;
export type DeleteChargeInput = z.infer<typeof deleteChargeSchema>;
export type ListChargesQuery = z.infer<typeof listChargesQuerySchema>;

export type CreateDiscountInput = z.infer<typeof createDiscountSchema>;
export type ListDiscountsQuery = z.infer<typeof listDiscountsQuerySchema>;
export type RejectDiscountInput = z.infer<typeof rejectDiscountSchema>;

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type DeletePaymentInput = z.infer<typeof deletePaymentSchema>;
export type ListPaymentsQuery = z.infer<typeof listPaymentsQuerySchema>;
export type CreateRefundInput = z.infer<typeof createRefundSchema>;

export type ListReceiptsQuery = z.infer<typeof listReceiptsQuerySchema>;
export type MyReceiptsQuery = z.infer<typeof myReceiptsQuerySchema>;

export type FinanceSummaryQuery = z.infer<typeof financeSummaryQuerySchema>;
export type OutstandingQuery = z.infer<typeof outstandingQuerySchema>;
export type RunRemindersInput = z.infer<typeof runRemindersSchema>;
