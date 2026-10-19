import type { Money } from './money';
export type StudentRow = {
  id: string;
  studentCode: string;
  status: string;
  /** Full money profile for finance/super admins only (the API strips it for academic staff). */
  finance?: {
    currency: string;
    totalDue?: Money; totalPaid?: Money; totalDiscount?: Money; balance?: Money;
    overdueAmount?: Money; nextDueAmount?: Money; nextDueAt?: string | null;
    status?: string; lastPaymentAt?: string | null;
  } | null;
  shift: string;
  user: { firstName: string; lastName: string; email: string; status: string };
  campus: { name: string } | null;
  currentLevel: { code: string; title: string } | null;
};
