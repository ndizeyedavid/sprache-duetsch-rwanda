import type { Money } from './money';
import type { SessionItem } from './session-item';
export type StudentDashboard = {
  currentLevel: { id: string; code: string; title: string; levelLabel: string } | null;
  intake: { id: string; code: string; name: string } | null;
  campus: { id: string; code: string; name: string } | null;
  classGroup: { id: string; code: string; name: string; shift: string } | null;
  progress: { lessonsCompleted: number; lessonsTotal: number; completionPercentage: number };
  nextLesson: { id: string; title: string; estimatedMinutes: number | null } | null;
  upcomingClass: SessionItem | null;
  nextExam: { id: string; title: string; type: string } | null;
  attendance: { percentage: number; present: number; absent: number; late: number; excused: number };
  finance: { totalDue: Money; totalPaid: Money; balance: Money; status: string; currency: string };
  unreadNotificationsCount: number;
};
