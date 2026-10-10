import { apiGet } from '.././api';
import type { Money } from './money';
export function listAttempts(status?: string, classGroupId?: string, assessmentId?: string): Promise<
  {
    id: string;
    status: string;
    attemptNumber: number;
    score: number | null;
    maxScore: Money;
    passed: boolean | null;
    submittedAt: string | null;
    student: { studentCode: string; user: { firstName: string; lastName: string } };
    assessment: { id: string; title: string };
  }[]
> {
  const params = new URLSearchParams({ pageSize: '100' });
  if (status) params.set('status', status);
  if (classGroupId) params.set('classGroupId', classGroupId);
  if (assessmentId) params.set('assessmentId', assessmentId);
  return apiGet(`/assessments/attempts?${params.toString()}`);
}
