import { apiGet } from '.././api';
import type { Certificate } from './certificate';
export function listCertificates(): Promise<Certificate[]> {
  return apiGet<Certificate[]>('/certificates?pageSize=100');
}
