import { apiGet } from '.././api';
import type { CertificateEligibility } from './certificate-eligibility';
export function checkCertificateEligibility(
  studentId: string,
  levelId: string,
): Promise<CertificateEligibility> {
  return apiGet<CertificateEligibility>(
    `/certificates/eligibility?studentId=${studentId}&levelId=${levelId}`,
  );
}
