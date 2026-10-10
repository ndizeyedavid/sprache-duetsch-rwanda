import { methodSummarySelect } from './method-summary-select.js';
import { studentSummarySelect } from './student-summary-select.js';
export const paymentInclude = {
  method: { select: methodSummarySelect },
  receipt: true,
  refunds: { select: { id: true, amount: true } },
  student: { select: studentSummarySelect },
} as const;
