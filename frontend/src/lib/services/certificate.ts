export type Certificate = {
  id: string;
  certificateNumber: string;
  verificationCode: string;
  status: string;
  issuedAt: string;
  revokedAt: string | null;
  revokeReason: string | null;
  level: { id: string; code: string; title: string };
  student?: {
    id: string;
    studentCode: string;
    user: { firstName: string; lastName: string; email: string };
  };
};
