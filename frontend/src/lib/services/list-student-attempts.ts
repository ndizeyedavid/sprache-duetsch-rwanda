import { apiGet } from '.././api';
import type { Money } from './money';
export type StudentAttempt = {
  id: string;
  status: string;
  attemptNumber: number;
  score: Money | null;
  maxScore: Money;
  passed: boolean | null;
  submittedAt: string | null;
  cheatFlagged?: boolean;
  assessment: { id: string; title: string };
};
export function listStudentAttempts(studentId: string): Promise<StudentAttempt[]> {
  return apiGet<StudentAttempt[]>(`/assessments/attempts?studentId=${studentId}&pageSize=100`);
}
