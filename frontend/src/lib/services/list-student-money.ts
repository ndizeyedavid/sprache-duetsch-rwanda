import { apiGet } from '.././api';
import type { PaymentRow } from './payment-row';
import type { StudentCharge } from './student-charge';
/** Finance roles only: what was billed and what was paid, newest first. */
export function listStudentCharges(studentId: string): Promise<StudentCharge[]> {
  return apiGet<StudentCharge[]>(`/payments/charges?studentId=${studentId}&pageSize=100`);
}
export function listStudentPayments(studentId: string): Promise<PaymentRow[]> {
  return apiGet<PaymentRow[]>(`/payments?studentId=${studentId}&pageSize=100`);
}
