import { apiPost } from './api';
import { pdfRequest } from './pdf-request';
import type { Certificate } from './services';
import type { CertificateDraft } from '../components/certificates/certificate-types';

export const previewCertificate = (draft: CertificateDraft): Promise<Blob> => pdfRequest('/certificates/preview', draft);
export const loadCertificatePdf = (id: string, signal?: AbortSignal): Promise<Blob> => pdfRequest(`/certificates/${id}/pdf`, undefined, signal);
export const createCertificate = (draft: CertificateDraft): Promise<Certificate> => apiPost<Certificate>('/certificates', draft);
