import { api,apiGet } from './api';

export type RiskLevel = 'HIGH' | 'MEDIUM';
export type RiskReasonCode = 'LOW_ATTENDANCE' | 'LOW_SCORE' | 'MISSING_HOMEWORK' | 'INACTIVE' | 'OVERDUE_FEES';
export type RiskReason = { code: RiskReasonCode; severity: RiskLevel; label: string; value?: number; threshold?: number };

export type AtRiskRow = {
  enrollmentId: string;
  student: { id: string; studentCode: string; firstName: string; lastName: string; avatarUrl: string | null };
  classGroup: { id: string; code: string; name: string } | null;
  level: { id: string; code: string };
  intake: { id: string; name: string };
  riskLevel: RiskLevel;
  reasons: RiskReason[];
  attendanceRate: number | null;
  attendanceThreshold: number;
  averageScore: number | null;
  missingHomework: number;
  lastActivityAt: string | null;
};

export type PageMeta = { page: number; pageSize: number; total: number; totalPages: number };
export type AtRiskPage = { data: AtRiskRow[]; meta: PageMeta; summary: { total: number; students: number; high: number; medium: number } };
export type AtRiskFilter = { classGroupId?: string; levelId?: string; intakeId?: string; riskLevel?: RiskLevel; page?: number; pageSize?: number };

const clean = (params: Record<string, unknown>) => Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''));

/** Paginated + summary — read the whole envelope, not only `data`. */
export async function getAtRiskStudents(filter: AtRiskFilter): Promise<AtRiskPage> {
  const { data } = await api.get<AtRiskPage & { success: true }>('/dashboards/at-risk', { params: clean(filter) });
  return { data: data.data, meta: data.meta, summary: data.summary };
}

export type RetentionCounts = { enrolled: number; active: number; completed: number; withdrawn: number; deferred: number; retentionRate: number | null; completionRate: number | null };
export type RetentionIntake = RetentionCounts & {
  intake: { id: string; code: string; name: string; startDate: string; endDate: string; isActive: boolean };
  levels: (RetentionCounts & { level: { id: string; code: string; title: string } })[];
};
export type Dropout = {
  enrollmentId: string; student: { id: string; studentCode: string; firstName: string; lastName: string };
  level: string; intake: string; className: string | null; enrolledAt: string; withdrawnAt: string; reason: string | null;
};
export type RetentionReport = { totals: RetentionCounts; intakes: RetentionIntake[]; recentDays: number; dropouts: Dropout[] };

export function getRetention(filter: { intakeId?: string; levelId?: string; recentDays?: number } = {}): Promise<RetentionReport> {
  return apiGet<RetentionReport>('/dashboards/retention', { params: clean(filter) });
}

export type BacklogRow = {
  teacher: { id: string; firstName: string; lastName: string; avatarUrl: string | null };
  classCount: number; homework: number; attempts: number; activities: number; total: number;
  oldestSubmittedAt: string | null; oldestWaitingHours: number | null; medianTurnaroundHours: number | null; gradedLast30Days: number;
};

/** Teachers receive only their own row. */
export function getGradingBacklog(teacherId?: string): Promise<BacklogRow[]> {
  return apiGet<BacklogRow[]>('/dashboards/grading-backlog', { params: clean({ teacherId }) });
}
