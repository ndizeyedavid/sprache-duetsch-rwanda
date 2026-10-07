export type CertificateVerification = {
  valid: boolean;
  status: string;
  certificateNumber: string;
  verificationCode: string;
  studentName: string;
  studentCode: string;
  levelCode: string;
  levelTitle: string;
  issuedAt: string;
  modules: { title: string; order: number; lessons: { title: string; order: number }[] }[];
  assessments: { title: string; type: string; score: number | null; maxScore: number; percentage: number | null; passed: boolean | null; submittedAt: string | null }[];
  activities: { title: string; type: string; score: number | null; maxScore: number; isCorrect: boolean | null; submittedAt: string }[];
};
