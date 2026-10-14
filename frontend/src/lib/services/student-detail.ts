import type { Money } from './money';

type LevelRef = { id: string; code: string; title: string; levelLabel: string };

/** `GET /students/:id`. Finance roles also get `finance` and enrolment fees; academic staff never do. */
export type StudentDetail = {
  id: string;
  studentCode: string;
  status: string;
  shift: string;
  dateOfBirth: string | null;
  gender: string | null;
  nationalId: string | null;
  address: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  placementScore: number | null;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; email: string; phone: string | null; avatarUrl: string | null; status: string };
  campus: { id: string; code: string; name: string } | null;
  intake: { id: string; code: string; name: string; startDate: string; endDate: string | null } | null;
  intendedLevel: LevelRef | null;
  currentLevel: LevelRef | null;
  finance?: {
    totalDue: Money; totalDiscount: Money; totalPaid: Money; balance: Money; overdueAmount: Money;
    nextDueAmount: Money | null; nextDueAt: string | null; currency: string; status: string; lastPaymentAt: string | null;
  } | null;
  enrollments: {
    id: string;
    status: string;
    enrolledAt: string;
    completedAt: string | null;
    totalFee?: Money;
    discountTotal?: Money;
    currency: string;
    level: LevelRef;
    intake: { id: string; code: string; name: string } | null;
    classGroup: { id: string; code: string; name: string; shift: string } | null;
  }[];
  certificates: { id: string; status: string; issuedAt: string }[];
  attendance: { total: number; present: number; absent: number; late: number; excused: number; percentage: number };
  attemptsCount: number;
};
