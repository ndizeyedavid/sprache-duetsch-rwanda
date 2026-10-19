import type { Money } from './services/money';

export type ApplicationStatus = 'NEW' | 'REVIEWING' | 'ACCEPTED' | 'WAITLISTED' | 'REJECTED' | 'ENROLLED' | 'WITHDRAWN';
export type ApplicationSource = 'WEBSITE' | 'CATALOG' | 'PORTAL' | 'WALK_IN';
export type Shift = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'WEEKEND';

export type CatalogLevel = {
  id: string; code: string; language: string; title: string; levelLabel: string;
  summary: string | null; objectives: string[]; defaultFee: Money; currency: string; order: number;
};

export type CatalogIntake = {
  id: string; code: string; name: string; startDate: string; endDate: string;
  registrationFee: Money; bookFee: Money; currency: string;
  levels: { id: string; code: string; title: string }[];
  seats: { levelId: string; campusId: string; seatsLeft: number | null }[];
};

export type CatalogCampus = { id: string; code: string; name: string; address: string | null; phone: string | null; email: string | null };

export type Catalog = {
  levels: CatalogLevel[];
  intakes: CatalogIntake[];
  campuses: CatalogCampus[];
  shifts: { value: Shift; label: string }[];
  generatedAt: string;
};

export type ApplicationPayload = {
  firstName: string; lastName: string; email: string; phone?: string;
  levelId: string; intakeId?: string; campusId?: string; shift?: Shift | '';
  experience?: string; message?: string; website?: string;
};

export type ApplicationReceipt = { reference: string | null; status: ApplicationStatus; duplicate: boolean };

type Ref = { id: string; code: string; name: string };

export type ApplicationRow = {
  id: string; reference: string; firstName: string; lastName: string; email: string; phone: string | null;
  levelId: string | null; intakeId: string | null; campusId: string | null; shift: Shift | null;
  experience: string | null; message: string | null; source: ApplicationSource; status: ApplicationStatus;
  rawPayload: Record<string, unknown> | null; decisionReason: string | null;
  reviewedAt: string | null; waitlistedAt: string | null; studentId: string | null; createdAt: string;
  level: { id: string; code: string; title: string } | null;
  intake: (Ref & { startDate: string }) | null;
  campus: Ref | null;
  reviewedBy: { id: string; firstName: string; lastName: string } | null;
  student: { id: string; studentCode: string; status: string } | null;
};

export type ApplicationHistoryEntry = {
  id: string; action: string; reason: string | null; createdAt: string;
  before: Record<string, unknown> | null; after: Record<string, unknown> | null;
  actor: { id: string; firstName: string; lastName: string } | null;
};

export type ApplicationDetail = ApplicationRow & {
  transitions: { status: ApplicationStatus; reasonRequired: boolean }[];
  waitlistPosition: number | null;
  history: ApplicationHistoryEntry[];
};

export type ApplicationFilters = {
  status?: ApplicationStatus; source?: ApplicationSource | ''; levelId?: string; intakeId?: string;
  campusId?: string; search?: string; from?: string; to?: string; page?: number; pageSize?: number;
};

export type PageMeta = { page: number; pageSize: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean };
export type Paged<T> = { data: T[]; meta: PageMeta };

export type WaitlistEntry = Pick<ApplicationRow, 'id' | 'reference' | 'firstName' | 'lastName' | 'email' | 'phone' | 'shift' | 'waitlistedAt' | 'createdAt' | 'decisionReason' | 'campus'> & { position: number };

export type WaitlistGroup = {
  key: string;
  level: { id: string; code: string; title: string } | null;
  intake: (Ref & { startDate: string }) | null;
  waiting: number; acceptedPending: number;
  capacity: number; enrolled: number; seatsLeft: number | null;
  entries: WaitlistEntry[];
};

export type StudentFromApplication = {
  studentId: string; studentCode: string; accountCreated: boolean; enrollmentId: string | null; status: ApplicationStatus;
  invite: { emailQueued: boolean; emailConfigured: boolean; expiresAt: string; setupUrl?: string } | null;
};
