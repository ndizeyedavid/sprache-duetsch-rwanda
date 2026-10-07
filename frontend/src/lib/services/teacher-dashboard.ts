export type TeacherDashboard = {
  classesCount: number;
  studentsCount: number;
  upcomingSessionsCount: number;
  pendingGradingCount: number;
  sessionsToday: {
    id: string;
    title: string;
    startAt: string;
    endAt: string;
    status: string;
    classGroup: { id: string; code: string; name: string };
  }[];
  recentAssessments: { id: string; title: string; type: string; createdAt: string }[];
};
