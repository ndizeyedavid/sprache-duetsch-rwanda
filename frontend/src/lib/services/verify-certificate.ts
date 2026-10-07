import { apiGet } from '.././api';
import type { CertificateVerification } from './certificate-verification';
export function verifyCertificate(code: string): Promise<CertificateVerification> {
  return apiGet<CertificateVerification>(`/certificates/verify/${encodeURIComponent(code)}`);
}
