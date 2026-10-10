export type CertificateVerification = {
  valid: boolean;
  status: string;
  certificateNumber: string;
  verificationCode: string;
  studentName: string;
  levelCode: string;
  levelTitle: string;
  completionDate: string | null;
  grade: string | null;
  issuedAt: string;
  issuedBy: string | null;
  issuedByRole: string | null;
  revokedAt: string | null;
};
