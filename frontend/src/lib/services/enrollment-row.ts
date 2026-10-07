import type { Money } from './money';
export type EnrollmentRow = {
  charges?: { id: string; type: string; amount: Money; dueDate: string | null }[];
  id: string;
  status: string;
  totalFee: Money;
  discountTotal: Money;
  currency: string;
  enrolledAt: string;
  student: { id: string; studentCode: string; user: { firstName: string; lastName: string; email: string } };
  level: { id: string; code: string; title: string };
  intake: { id: string; code: string; name: string };
  classGroup: { id: string; code: string; name: string; shift: string } | null;
};
