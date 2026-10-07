import { apiGet } from '.././api';
import type { Certificate } from './certificate';
export function listMyCertificates(): Promise<Certificate[]> {
  return apiGet<Certificate[]>('/certificates/my');
}
