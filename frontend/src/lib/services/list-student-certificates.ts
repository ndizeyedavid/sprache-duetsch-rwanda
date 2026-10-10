import { apiGet } from '.././api';
import type { Certificate } from './certificate';
export function listStudentCertificates(studentId: string): Promise<Certificate[]> {
  return apiGet<Certificate[]>(`/certificates?studentId=${studentId}&pageSize=100`);
}
