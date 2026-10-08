export type CertificateEligibility = {
  eligible: boolean;
  reasons: string[];
  studentName: string;
  lessonsTotal: number;
  lessonsCompleted: number;
  completionPercentage: number;
  finalExamPassed: boolean | null;
  existingCertificate: { id: string; certificateNumber: string } | null;
  attendancePercentage: number;
  homeworkPassed: boolean;
  rules: { minimumAttendance: number; requireHomework: boolean; homeworkPassMark: number };
};
