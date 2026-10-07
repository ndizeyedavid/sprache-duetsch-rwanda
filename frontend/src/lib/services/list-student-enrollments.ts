import { apiGet } from '../api';
import type { EnrollmentRow } from './enrollment-row';
export const listStudentEnrollments = (studentId: string) => apiGet<EnrollmentRow[]>(`/enrollments?studentId=${encodeURIComponent(studentId)}&pageSize=100`);
