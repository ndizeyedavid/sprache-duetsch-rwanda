import { z } from "zod";
import { idParam,optionalText,paginationQuery } from "../../lib/query.js";

const money = z.coerce.number().positive().max(100_000_000);
const reason = z.string().trim().min(3).max(500);

/** Student: "I paid outside the gateway — here is the reference." */
export const submitClaimSchema = z.object({
  methodId: z.string().min(1),
  amount: money,
  reference: optionalText(120),
  paidAt: z.coerce.date(),
  note: optionalText(500),
}).strict();

export const listClaimsQuerySchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  studentId: z.string().min(1).optional(),
  intakeId: z.string().min(1).optional(),
  ...paginationQuery,
});

/** Finance may correct the amount (e.g. the bank statement shows less) before approving. */
export const approveClaimSchema = z.object({ amount: money.optional(), note: optionalText(500) }).strict();
export const rejectClaimSchema = z.object({ reason }).strict();

/** "Mark as paid": record the student's whole current balance in one step. */
export const settleBalanceSchema = z.object({
  methodId: z.string().min(1),
  /** The balance the officer saw; refused if it changed meanwhile, so nothing is over- or under-recorded. */
  expectedBalance: money,
  reference: optionalText(120),
  paidAt: z.coerce.date().optional(),
  notes: optionalText(500),
}).strict();

export const claimIdParams = idParam;
export const settleParams = z.object({ studentId: z.string().min(1) });

export type SubmitClaimInput = z.infer<typeof submitClaimSchema>;
export type ListClaimsQuery = z.infer<typeof listClaimsQuerySchema>;
export type ApproveClaimInput = z.infer<typeof approveClaimSchema>;
export type SettleBalanceInput = z.infer<typeof settleBalanceSchema>;
