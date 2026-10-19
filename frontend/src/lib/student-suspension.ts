import { apiPost } from './api';

/** Academic/super admin: ban a student with a reason they will see when they sign in. */
export const suspendStudent = (studentId: string, reason: string) => apiPost(`/students/${studentId}/suspend`, { reason });
export const reinstateStudent = (studentId: string) => apiPost(`/students/${studentId}/reinstate`, {});

/** Common reasons as one-tap starters; the admin can edit the text before saving. */
export const QUICK_REASONS = [
  'Tuition is unpaid. Please settle your balance with the finance office.',
  'Repeated absence from class without notice.',
  'Cheating during an exam or assignment.',
  'Behaviour that breaks the school rules.',
];
