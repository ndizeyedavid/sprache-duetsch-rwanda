export type AcademicDashboard = {
  totalStudents: number;
  activeStudents: number;
  newRegistrations: number;
  completed: number;
  withdrawn: number;
  byLevel: { levelId: string; count: number }[];
  byCampus: { campusId: string; count: number }[];
  byIntake: { intakeId: string; count: number }[];
  averageScore: number;
  completionRate: number;
  attendanceRate: number;
  passRate: number;
  atRiskStudents: number;
};
