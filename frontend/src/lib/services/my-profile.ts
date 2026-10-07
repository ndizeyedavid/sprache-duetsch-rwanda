import type { Money } from './money';
export type MyProfile = {
  user: { id: string; firstName: string; lastName: string; email: string; phone: string | null; status: string; avatarUrl: string | null };
  studentCode: string;
  campus: { id: string; code: string; name: string } | null;
  intake: { id: string; code: string; name: string } | null;
  intendedLevel: { id: string; code: string; title: string; levelLabel: string } | null;
  currentLevel: { id: string; code: string; title: string; levelLabel: string } | null;
  finance: { totalDue: Money; totalPaid: Money; balance: Money; status: string; currency: string; overdueAmount?: Money; nextDueAmount?: Money; nextDueAt?: string | null } | null;
  enrollments: {
    id?: string;
    status?: string;
    level: { id: string; code: string; title: string; levelLabel?: string };
    intake?: { id: string; code: string; name: string } | null;
    classGroup: { id: string; code: string; name: string; shift: string } | null;
  }[];
  attendance: { total: number; present: number; absent: number; late: number; excused: number; percentage: number };
  certificates: number;
  lessonsCompleted: number;
};
