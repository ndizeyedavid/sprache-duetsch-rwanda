import { methodSummarySelect } from './method-summary-select.js';
export const receiptInclude = {
  payment: {
    select: {
      id: true,
      amount: true,
      currency: true,
      txnType: true,
      reference: true,
      paidAt: true,
      student: {
        select: {
          id: true,
          studentCode: true,
          userId: true,
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      },
      method: { select: methodSummarySelect },
    },
  },
} as const;
