import { api,apiGet,apiPost } from './api';
import type { Money } from './services/money';

export type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/** A payment a student made outside the gateway and reported for finance to confirm. */
export type PaymentClaim = {
  id: string;
  amount: Money;
  currency: string;
  reference: string | null;
  paidAt: string;
  note: string | null;
  status: ClaimStatus;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  method: { id: string; code: string; name: string };
  reviewedBy: { firstName: string; lastName: string } | null;
  payment: { id: string; receipt: { id: string; receiptNumber: string } | null } | null;
};

export type StaffPaymentClaim = PaymentClaim & {
  student: {
    id: string; studentCode: string;
    user: { firstName: string; lastName: string; email: string; phone: string | null };
    finance: { balance: Money; currency: string; status: string } | null;
  };
};

export type ClaimPage = { data: StaffPaymentClaim[]; meta: { total: number; page: number; totalPages: number }; summary: { pending: number } };

export type OutstandingRow = {
  studentId: string; balance: Money; overdueAmount: Money; currency: string; status: string;
  student: { id: string; studentCode: string; user: { firstName: string; lastName: string; email: string } };
};

const BASE = '/payments/manual';

// Student
export const listMyClaims = () => apiGet<PaymentClaim[]>(`${BASE}/claims/my`);
export const submitClaim = (body: { methodId: string; amount: number; reference?: string; paidAt: string; note?: string }) =>
  apiPost<PaymentClaim>(`${BASE}/claims`, body);
export const withdrawClaim = (id: string) => apiPost<PaymentClaim>(`${BASE}/claims/${id}/withdraw`);

// Finance
export async function listClaims(status: ClaimStatus | undefined, page = 1, pageSize = 20): Promise<ClaimPage> {
  const { data } = await api.get<ClaimPage & { success: true }>(`${BASE}/claims`, { params: { status, page, pageSize } });
  return { data: data.data, meta: data.meta, summary: data.summary };
}
export const approveClaim = (id: string, body: { amount?: number; note?: string }) => apiPost(`${BASE}/claims/${id}/approve`, body);
export const rejectClaim = (id: string, reason: string) => apiPost(`${BASE}/claims/${id}/reject`, { reason });
export const settleBalance = (studentId: string, body: { methodId: string; expectedBalance: number; reference?: string; paidAt?: string; notes?: string }) =>
  apiPost(`${BASE}/settle/${studentId}`, body);

export async function listOutstanding(): Promise<OutstandingRow[]> {
  const { data } = await api.get<{ data: OutstandingRow[] }>('/payments/reports/outstanding', { params: { pageSize: 100 } });
  return data.data;
}
