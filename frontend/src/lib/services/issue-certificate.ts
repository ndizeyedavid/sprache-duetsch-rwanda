import { apiPost } from '.././api';
import type { Certificate } from './certificate';
export function issueCertificate(body: {
  studentId: string;
  levelId: string;
  enrollmentId?: string;
}): Promise<Certificate> {
  return apiPost<Certificate>('/certificates', body);
}
