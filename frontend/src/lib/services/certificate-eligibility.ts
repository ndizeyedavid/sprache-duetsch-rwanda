export type CertificateEligibility = {
  eligible: boolean;
  reasons: string[];
  studentName: string;
  lessonsTotal: number;
  lessonsCompleted: number;
  completionPercentage: number;
  finalExamPassed: boolean | null;
  existingCertificate: { id: string; certificateNumber: string } | null;
};
