import { apiGet,apiPost } from '../api';
import type { EnrollmentRow } from './enrollment-row';

/** Every enrolment with course access, sign-in and lesson progress (no page cap). */
export const getEnrolmentRegister = () => apiGet<EnrollmentRow[]>('/enrollments/register');

export type AssignClassResult = { assigned: string[]; skipped: { id: string; name: string; reason: string }[] };

/** Put enrolments into one class, or take them out with `null`; full classes or mismatches are skipped with a reason. */
export const assignEnrolmentsToClass = (enrollmentIds: string[], classGroupId: string | null) =>
  apiPost<AssignClassResult>('/enrollments/assign-class', { enrollmentIds, classGroupId });
