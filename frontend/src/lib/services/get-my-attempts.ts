import { apiGet } from '.././api';
import type { MyAttempt } from './my-attempt';
export function getMyAttempts(): Promise<MyAttempt[]> {
  return apiGet<MyAttempt[]>('/assessments/my/attempts');
}
