import { api, apiDelete, apiGet, apiPatch, apiPost } from './api';

/** Prisma Decimal serialises as a string — accept both. */
export type Money = string | number;

export function money(value: Money | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const parsed = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(parsed) ? parsed : 0;
}

export function isoDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** `PARTIALLY_PAID` → `Partially Paid` for badges and labels. */
export function humanize(value: string | null | undefined): string {
  if (!value) return '—';
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function isoTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

// ---------------------------------------------------------------------------
// Levels / reference data
// ---------------------------------------------------------------------------

export type LevelItem = {
  id: string;
  code: string;
  language: string;
  title: string;
  levelLabel: string;
  summary: string | null;
  objectives: string[];
  order: number;
  defaultFee: Money;
  currency: string;
  isActive: boolean;
};

export type ReferenceItem = {
  id: string;
  code: string;
  name?: string;
  title?: string;
};

export function listLevels(): Promise<LevelItem[]> {
  return apiGet<LevelItem[]>('/levels?pageSize=100');
}

export function getLevel(id: string): Promise<LevelItem> {
  return apiGet<LevelItem>(`/levels/${id}`);
}

export function listCampuses(): Promise<ReferenceItem[]> {
  return apiGet<ReferenceItem[]>('/campuses?pageSize=100');
}

export function listIntakes(): Promise<ReferenceItem[]> {
  return apiGet<ReferenceItem[]>('/intakes?pageSize=100');
}

// ---------------------------------------------------------------------------
// Student learning content
// ---------------------------------------------------------------------------

export type MyLesson = {
  id: string;
  title: string;
  description: string | null;
  order: number;
  contentType: string;
  estimatedMinutes: number | null;
  progressStatus: string;
  secondsWatched: number | null;
  completedAt: string | null;
};

export type MyCourse = {
  level: LevelItem;
  lessons: MyLesson[];
  modules?: { id: string; title: string }[];
  stats: { totalLessons: number; completedLessons: number; completionPercentage: number };
};

export type LessonMaterial = {
  id: string;
  title: string;
  type: string;
  url: string;
  mimeType: string | null;
  isDownloadable: boolean;
};

export type LessonActivity = {
  id: string;
  title: string;
  type: string;
  instructions: string | null;
  order: number;
};

export type StudentLesson = {
  id: string;
  title: string;
  description: string | null;
  contentType: string;
  body: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
  estimatedMinutes: number | null;
  module: { id: string; title: string; levelId: string; level: LevelItem };
  materials: LessonMaterial[];
  activities: LessonActivity[];
  progressStatus: string;
  lockedByPrerequisite: boolean;
};

export function getMyCourses(): Promise<MyCourse[]> {
  return apiGet<MyCourse[]>('/content/my/courses');
}

export function getStudentLesson(id: string): Promise<StudentLesson> {
  return apiGet<StudentLesson>(`/content/my/lessons/${id}`);
}

export function completeLesson(id: string): Promise<unknown> {
  return apiPost(`/content/my/lessons/${id}/progress`, { status: 'COMPLETED' });
}

export function getMyNotes(): Promise<LessonMaterial[]> {
  return apiGet<LessonMaterial[]>('/content/my/notes?pageSize=50');
}

// ---------------------------------------------------------------------------
// Sessions / attendance
// ---------------------------------------------------------------------------

export type SessionItem = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  timezone: string | null;
  mode: string;
  provider: string | null;
  status: string;
  meetingUrl: string | null;
  teacher: { firstName: string; lastName: string } | null;
  classGroup: { id: string; name: string } | null;
};

export type AttendanceSummary = {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  percentage: number;
};

export type AttendanceRecord = {
  id: string;
  status: string;
  note: string | null;
  markedAt: string | null;
  session: { id: string; title: string; startAt: string; endAt: string };
};

export function getUpcomingSessions(): Promise<SessionItem[]> {
  return apiGet<SessionItem[]>('/sessions/me/upcoming');
}

export function getMySessions(): Promise<SessionItem[]> {
  return apiGet<SessionItem[]>('/sessions/me?pageSize=50');
}

export function getMyAttendance(): Promise<{ history: AttendanceRecord[]; summary: AttendanceSummary }> {
  return apiGet('/attendance/me');
}

export function getAttendanceSummary(): Promise<AttendanceSummary> {
  return apiGet('/attendance/summary');
}

export type SessionRosterRow = {
  studentId: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  status: string | null;
  note: string | null;
};

export function listSessions(): Promise<SessionItem[]> {
  return apiGet<SessionItem[]>('/sessions?pageSize=100');
}

export function getSession(id: string): Promise<SessionItem> {
  return apiGet<SessionItem>(`/sessions/${id}`);
}

export function getSessionRoster(id: string): Promise<SessionRosterRow[]> {
  return apiGet<SessionRosterRow[]>(`/sessions/${id}/roster`);
}

export function createSession(body: Record<string, unknown>): Promise<SessionItem> {
  return apiPost<SessionItem>('/sessions', body);
}

export function updateSession(id: string, body: Record<string, unknown>): Promise<SessionItem> {
  return apiPatch<SessionItem>(`/sessions/${id}`, body);
}

export function markSessionAttendance(
  id: string,
  records: { studentId: string; status: string }[],
): Promise<unknown> {
  return apiPost(`/sessions/${id}/attendance`, { records });
}

// ---------------------------------------------------------------------------
// Dashboards
// ---------------------------------------------------------------------------

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

export type FinanceSummary = {
  totalBilled: Money;
  totalCollected: Money;
  totalOutstanding: Money;
  collectionRate: number;
  byMethod: { methodId: string; methodName: string | null; total: Money }[];
  byLevel: { key: string; label: string; billed: Money; collected: Money; outstanding: Money }[];
  byCampus: { key: string; label: string; billed: Money; collected: Money; outstanding: Money }[];
};

export function getStudentDashboard(): Promise<StudentDashboard> {
  return apiGet<StudentDashboard>('/dashboards/student');
}

export function getAcademicDashboard(): Promise<AcademicDashboard> {
  return apiGet<AcademicDashboard>('/dashboards/academic');
}

export function getFinanceReportSummary(): Promise<FinanceSummary> {
  return apiGet<FinanceSummary>('/payments/reports/summary');
}

// ---------------------------------------------------------------------------
// Students / teachers / enrollments
// ---------------------------------------------------------------------------

export type MyProfile = {
  user: { id: string; firstName: string; lastName: string; email: string; phone: string | null; status: string };
  studentCode: string;
  campus: { id: string; code: string; name: string } | null;
  intake: { id: string; code: string; name: string } | null;
  intendedLevel: { id: string; code: string; title: string } | null;
  currentLevel: { id: string; code: string; title: string } | null;
  finance: { totalDue: Money; totalPaid: Money; balance: Money; status: string; currency: string } | null;
  enrollments: {
    level: { id: string; code: string; title: string };
    classGroup: { id: string; code: string; name: string; shift: string } | null;
  }[];
  attendance: { total: number; present: number; absent: number; late: number; excused: number; percentage: number };
  certificates: number;
  lessonsCompleted: number;
};

export type StudentRow = {
  id: string;
  studentCode: string;
  status: string;
  shift: string;
  user: { firstName: string; lastName: string; email: string; status: string };
  campus: { name: string } | null;
  currentLevel: { code: string; title: string } | null;
};

export type TeacherRow = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  status: string;
};

export type MyProgressLevel = {
  id: string;
  code: string;
  title: string;
  levelLabel: string;
  completionPercentage: number;
  modules: {
    id: string;
    title: string;
    lessons: { id: string; title: string; status: string; completedAt: string | null }[];
  }[];
};

export function getMyProfile(): Promise<MyProfile> {
  return apiGet<MyProfile>('/students/me');
}

export function getMyProgress(): Promise<{ levels: MyProgressLevel[]; overallPercentage: number }> {
  return apiGet('/students/me/progress');
}

export function listStudents(): Promise<StudentRow[]> {
  return apiGet<StudentRow[]>('/students?pageSize=100');
}

export function listTeachers(): Promise<TeacherRow[]> {
  return apiGet<TeacherRow[]>('/users/teachers');
}

export function getMyEnrollments(): Promise<
  { id: string; status: string; level: { code: string; title: string }; classGroup: { name: string; shift: string } | null }[]
> {
  return apiGet('/enrollments/me');
}

// ---------------------------------------------------------------------------
// Payments (student + finance)
// ---------------------------------------------------------------------------

export type MyFinance = {
  finance: { totalDue: Money; totalPaid: Money; balance: Money; status: string; currency: string } | null;
  charges: { id: string; type: string; amount: Money; currency: string; createdAt: string }[];
  payments: {
    id: string;
    amount: Money;
    currency: string;
    reference: string | null;
    paidAt: string;
    method: { name: string } | null;
  }[];
  discounts: { id: string; amount: Money | null; status: string }[];
};

export type ReceiptRow = {
  id: string;
  receiptNumber: string;
  issuedAt: string;
  payment: {
    amount: Money;
    currency: string;
    reference: string | null;
    paidAt: string;
    method: { name: string } | null;
  };
};

export type PaymentRow = {
  id: string;
  amount: Money;
  currency: string;
  reference: string | null;
  paidAt: string;
  method: { name: string } | null;
  receipt: { id: string; receiptNumber: string } | null;
  student: { studentCode: string; user: { firstName: string; lastName: string } };
};

export function getMyFinance(): Promise<MyFinance> {
  return apiGet<MyFinance>('/payments/me/finance');
}

export function getMyReceipts(): Promise<ReceiptRow[]> {
  return apiGet<ReceiptRow[]>('/payments/me/receipts?pageSize=50');
}

export function listPayments(): Promise<PaymentRow[]> {
  return apiGet<PaymentRow[]>('/payments?pageSize=100');
}

export function recordPayment(body: Record<string, unknown>): Promise<unknown> {
  return apiPost('/payments', body);
}

export type PaymentMethod = { id: string; code: string; name: string };

export function listPaymentMethods(): Promise<PaymentMethod[]> {
  return apiGet<PaymentMethod[]>('/payments/methods');
}

export type DiscountRow = {
  id: string;
  type: string;
  value: Money;
  reason: string;
  status: string;
  student: { studentCode: string; user: { firstName: string; lastName: string } };
};

export function listDiscounts(status?: string): Promise<DiscountRow[]> {
  const query = status ? `?status=${status}&pageSize=100` : '?pageSize=100';
  return apiGet<DiscountRow[]>(`/payments/discounts${query}`);
}

export function approveDiscount(id: string): Promise<unknown> {
  return apiPost(`/payments/discounts/${id}/approve`, {});
}

export function rejectDiscount(id: string, reason: string): Promise<unknown> {
  return apiPost(`/payments/discounts/${id}/reject`, { reason });
}

export function createDiscount(body: Record<string, unknown>): Promise<DiscountRow> {
  return apiPost<DiscountRow>('/payments/discounts', body);
}

export function runPlacement(
  studentId: string,
  body: { score: number; recommendedLevelId?: string; note?: string },
): Promise<{ score: number; recommendedLevel: { id: string; code: string; title: string } }> {
  return apiPost(`/students/${studentId}/placement`, body);
}

export function deletePayment(id: string): Promise<unknown> {
  return apiDelete(`/payments/${id}`);
}

// ---------------------------------------------------------------------------
// Assessments
// ---------------------------------------------------------------------------

export type MyAssessment = {
  id: string;
  title: string;
  type: string;
  levelId: string;
  durationMinutes: number | null;
  maxAttempts: number | null;
  passMark: number | null;
  availableFrom: string | null;
  availableUntil: string | null;
  attemptCount: number;
  bestScore: number | null;
};

export type MyAttempt = {
  id: string;
  attemptNumber: number;
  status: string;
  score: number | null;
  passed: boolean | null;
  submittedAt: string | null;
  assessment: { id: string; title: string };
};

export function getMyAssessments(): Promise<MyAssessment[]> {
  return apiGet<MyAssessment[]>('/assessments/my/assessments?pageSize=50');
}

export function getMyAttempts(): Promise<MyAttempt[]> {
  return apiGet<MyAttempt[]>('/assessments/my/attempts');
}

export type SkillStat = {
  skill: string;
  answered: number;
  earned: number;
  possible: number;
  percentage: number;
};

export function getMySkills(): Promise<SkillStat[]> {
  return apiGet<SkillStat[]>('/assessments/my/skills');
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  readAt: string | null;
  createdAt: string;
};

export function listNotifications(): Promise<NotificationItem[]> {
  return apiGet<NotificationItem[]>('/notifications?pageSize=50');
}

export function unreadCount(): Promise<{ count: number }> {
  return apiGet<{ count: number }>('/notifications/unread-count');
}

export function markNotificationRead(id: string): Promise<unknown> {
  return apiPatch(`/notifications/${id}/read`, {});
}

export function markAllNotificationsRead(): Promise<unknown> {
  return apiPost('/notifications/read-all', {});
}

export type ClassGroupItem = {
  id: string;
  code: string;
  name: string;
  shift: string;
  levelId: string;
};

export function listClasses(): Promise<ClassGroupItem[]> {
  return apiGet<ClassGroupItem[]>('/classes?pageSize=100');
}

export function createAnnouncement(body: { title: string; body: string }): Promise<NotificationItem> {
  return apiPost<NotificationItem>('/notifications/announcements', body);
}

// ---------------------------------------------------------------------------
// Academic CMS (levels → modules → lessons)
// ---------------------------------------------------------------------------

export type ModuleItem = {
  id: string;
  title: string;
  description: string | null;
  order: number;
};

export function listLevelModules(levelId: string): Promise<ModuleItem[]> {
  return apiGet<ModuleItem[]>(`/content/levels/${levelId}/modules`);
}

export function createLevel(body: Record<string, unknown>): Promise<LevelItem> {
  return apiPost<LevelItem>('/levels', body);
}

export function updateLevel(id: string, body: Record<string, unknown>): Promise<LevelItem> {
  return apiPatch<LevelItem>(`/levels/${id}`, body);
}

export function createModule(levelId: string, body: Record<string, unknown>): Promise<ModuleItem> {
  return apiPost<ModuleItem>(`/content/levels/${levelId}/modules`, body);
}

// ---------------------------------------------------------------------------
// Direct messaging
// ---------------------------------------------------------------------------

export type ChatParticipant = {
  userId: string;
  lastReadAt: string | null;
  user: { id: string; firstName: string; lastName: string; role: string };
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  sender: { id: string; firstName: string; lastName: string };
};

export type Conversation = {
  id: string;
  title: string | null;
  classGroupId: string | null;
  createdAt: string;
  updatedAt: string;
  participants: ChatParticipant[];
  messages: ChatMessage[];
  unreadCount: number;
};

export type Contact = { id: string; firstName: string; lastName: string; role: string };

export function listConversations(): Promise<Conversation[]> {
  return apiGet<Conversation[]>('/messages/conversations');
}

export function createConversation(body: {
  participantIds: string[];
  title?: string;
}): Promise<Conversation> {
  return apiPost<Conversation>('/messages/conversations', body);
}

export function listThreadMessages(conversationId: string): Promise<ChatMessage[]> {
  return apiGet<ChatMessage[]>(`/messages/conversations/${conversationId}/messages?pageSize=100`);
}

export function sendChatMessage(conversationId: string, body: string): Promise<ChatMessage> {
  return apiPost<ChatMessage>(`/messages/conversations/${conversationId}/messages`, { body });
}

export function markConversationRead(conversationId: string): Promise<unknown> {
  return apiPost(`/messages/conversations/${conversationId}/read`, {});
}

export function listContacts(): Promise<Contact[]> {
  return apiGet<Contact[]>('/messages/contacts');
}

// ---------------------------------------------------------------------------
// Activity feed
// ---------------------------------------------------------------------------

export type FeedEvent = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  actorId: string | null;
  actorName: string | null;
  createdAt: string;
};

export function getFeed(type?: string): Promise<FeedEvent[]> {
  const query = type ? `?type=${type}&pageSize=50` : '?pageSize=50';
  return apiGet<FeedEvent[]>(`/activity/feed${query}`);
}

export function postFeedEvent(body: { type: string; title: string; body?: string }): Promise<FeedEvent> {
  return apiPost<FeedEvent>('/activity/events', body);
}

// ---------------------------------------------------------------------------
// Articles + FAQs
// ---------------------------------------------------------------------------

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  coverImageUrl: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  author: { id: string; firstName: string; lastName: string } | null;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  order: number;
  isPublished: boolean;
};

export function listArticles(search?: string): Promise<Article[]> {
  const query = search ? `?search=${encodeURIComponent(search)}&pageSize=30` : '?pageSize=30';
  return apiGet<Article[]>(`/articles/articles${query}`);
}

export function getArticle(slug: string): Promise<Article> {
  return apiGet<Article>(`/articles/articles/${slug}`);
}

export function createArticle(body: Record<string, unknown>): Promise<Article> {
  return apiPost<Article>('/articles/articles', body);
}

export function listFaqs(): Promise<FaqItem[]> {
  return apiGet<FaqItem[]>('/articles/faqs');
}

export function createFaq(body: Record<string, unknown>): Promise<FaqItem> {
  return apiPost<FaqItem>('/articles/faqs', body);
}

export type UploadResult = {
  url: string;
  mimeType: string;
  sizeBytes: number;
  originalName: string;
};

/** Staff file upload (images, audio, PDFs) for lesson materials and article covers. */
export async function uploadFile(file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post<{ success: boolean; data: UploadResult }>('/uploads', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

// ---------------------------------------------------------------------------
// Certificates
// ---------------------------------------------------------------------------

export type Certificate = {
  id: string;
  certificateNumber: string;
  verificationCode: string;
  status: string;
  issuedAt: string;
  revokedAt: string | null;
  revokeReason: string | null;
  level: { id: string; code: string; title: string };
  student?: {
    id: string;
    studentCode: string;
    user: { firstName: string; lastName: string; email: string };
  };
};

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

export type CertificateVerification = {
  valid: boolean;
  status: string;
  certificateNumber: string;
  studentName: string;
  levelCode: string;
  levelTitle: string;
  issuedAt: string;
};

export function listMyCertificates(): Promise<Certificate[]> {
  return apiGet<Certificate[]>('/certificates/my');
}

export function listCertificates(): Promise<Certificate[]> {
  return apiGet<Certificate[]>('/certificates?pageSize=100');
}

export function checkCertificateEligibility(
  studentId: string,
  levelId: string,
): Promise<CertificateEligibility> {
  return apiGet<CertificateEligibility>(
    `/certificates/eligibility?studentId=${studentId}&levelId=${levelId}`,
  );
}

export function issueCertificate(body: {
  studentId: string;
  levelId: string;
  enrollmentId?: string;
}): Promise<Certificate> {
  return apiPost<Certificate>('/certificates', body);
}

export function revokeCertificate(id: string, reason: string): Promise<Certificate> {
  return apiPost<Certificate>(`/certificates/${id}/revoke`, { reason });
}

export function verifyCertificate(code: string): Promise<CertificateVerification> {
  return apiGet<CertificateVerification>(`/certificates/verify/${encodeURIComponent(code)}`);
}
