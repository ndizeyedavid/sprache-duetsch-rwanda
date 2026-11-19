import type { Money } from './money';

/** Can the student open the course: paid and live (OPEN), owing tuition (UNPAID), account blocked, or enrolment closed. */
export type CourseAccess = 'OPEN' | 'UNPAID' | 'SUSPENDED' | 'CLOSED';

export type EnrollmentRow = {
  /** Finance roles only (the register leaves money out for academic admins). */
  charges?: { id: string; type: string; amount: Money; dueDate: string | null }[];
  id: string;
  status: string;
  totalFee?: Money;
  discountTotal?: Money;
  currency: string;
  enrolledAt: string;
  student: {
    id: string; studentCode: string; status?: string;
    user: { firstName: string; lastName: string; email: string; phone?: string | null; status?: string; lastLoginAt?: string | null };
  };
  level: { id: string; code: string; title: string };
  intake: { id: string; code: string; name: string };
  campus?: { id: string; code: string; name: string };
  classGroup: { id: string; code: string; name: string; shift: string } | null;
  /** Register extras (GET /enrollments/register). */
  access?: CourseAccess;
  tuition?: { outstanding: Money; overdue: boolean };
  progress?: { lessonsDone: number; lessonsTotal: number };
  lastLoginAt?: string | null;
};
