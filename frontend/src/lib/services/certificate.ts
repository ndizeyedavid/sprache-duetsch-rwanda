import type { CertificateDesign } from '../../components/certificates/certificate-types';

export type Certificate = {
  id: string;
  certificateNumber: string;
  verificationCode: string;
  status: string;
  issuedAt: string;
  revokedAt: string | null;
  revokeReason: string | null;
  pdfUrl?: string | null;
  metadata?: { document?: { studentName: string; studentCode: string; levelCode: string; levelTitle: string; design: CertificateDesign } } | null;
  level: { id: string; code: string; title: string };
  student?: {
    id: string;
    studentCode: string;
    user: { firstName: string; lastName: string; email: string };
  };
};
