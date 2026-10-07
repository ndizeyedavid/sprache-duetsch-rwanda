import { apiPost } from '.././api';
import type { Certificate } from './certificate';
export function revokeCertificate(id: string, reason: string): Promise<Certificate> {
  return apiPost<Certificate>(`/certificates/${id}/revoke`, { reason });
}
