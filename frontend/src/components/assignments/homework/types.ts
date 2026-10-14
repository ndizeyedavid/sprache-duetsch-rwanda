export type HomeworkQuestion = { id: string; order: number; points: string | null; question: { id: string; type: string; prompt: string; points: string; options: unknown; audioUrl: string | null; imageUrl: string | null; skill: string; difficulty: string; correctAnswer?: unknown } };
export type HomeworkSummary = { assigned: number; received: number; missing: number; toReview: number; graded: number; returned: number; averageScore: number | null };
export type Resource = { title: string; url: string };
export type RubricCriterion = { title: string; description: string; points: number };
export type Homework = {
  id: string; title: string; instructions: string; classGroupId: string; responseType: 'TEXT' | 'FILE' | 'AUDIO' | 'MIXED';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; dueAt: string | null; releaseAt: string | null; estimatedMinutes: number;
  maxPoints: string | number; allowLate: boolean; maxSubmissions: number; resources: Resource[]; rubric: RubricCriterion[];
  gracePeriodMinutes: number; latePenaltyPercentPerDay: string | number; latePenaltyMaxPercent: string | number;
  lessonId: string | null; lesson?: { id: string; title: string } | null;
  /** Student views only: the class deadline before a personal extension, and the extension itself. */
  originalDueAt?: string | null; extension?: { dueAt: string; reason: string | null } | null;
  classGroup: { id: string; name: string; level: { code: string; title: string } };
  createdBy: { firstName: string; lastName: string }; recipients: { studentId: string }[];
  questions?: HomeworkQuestion[]; summary?: HomeworkSummary;
  submissions?: Submission[];
};
export type Attachment = { id: string; originalName: string; mimeType: string; sizeBytes: number };
export type Lateness = { isLate: boolean; lateByMinutes: number | null; penaltyPercent: number };
type Graded = { score: string | null; rawScore?: string | null; latePenaltyPercent?: string | null; feedback: string | null; feedbackAudioFileId?: string | null };
export type Version = Graded & { id: string; revision: number; text: string; responses?: Record<string, unknown>; questionScores?: (number | null)[]; fileIds: string[]; submittedAt: string; isLate: boolean; lateByMinutes?: number | null; gradedAt: string | null };
export type Submission = Graded & { id: string; studentId: string; status: 'DRAFT' | 'SUBMITTED' | 'RETURNED' | 'GRADED'; text: string; responses?: Record<string, unknown>; questionScores?: (number | null)[]; fileIds: string[]; revision: number; rubricScores: number[] | null; submittedAt: string | null; updatedAt: string; versions?: Version[]; student?: RosterStudent; lateness?: Lateness | null };
export type Extension = { studentId: string; dueAt: string; reason: string | null; updatedAt: string; grantedBy: { firstName: string; lastName: string } };
export type RosterStudent = { id: string; studentCode: string; user: { firstName: string; lastName: string } };
export type HomeworkDetail = { assignment: Homework; submission: Submission | null; files: Attachment[]; feedbackFiles?: Attachment[] };
export type StaffHomeworkDetail = { assignment: Homework; submissions: Submission[]; roster: RosterStudent[]; files: Attachment[]; extensions: Extension[] };
export type HomeworkInput = Omit<Homework, 'id' | 'classGroup' | 'createdBy' | 'recipients' | 'submissions' | 'maxPoints' | 'questions' | 'summary' | 'lesson' | 'originalDueAt' | 'extension' | 'latePenaltyPercentPerDay' | 'latePenaltyMaxPercent'>
  & { maxPoints: number; latePenaltyPercentPerDay: number; latePenaltyMaxPercent: number; studentIds: string[]; questions: import('../../questions/types').AuthoredQuestion[] };
