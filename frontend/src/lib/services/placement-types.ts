import type { MyAssessmentDetail } from './my-assessment-detail';

export type PlacementLevelRef = { id: string; code: string; title: string; levelLabel: string };

export type PlacementStatus = 'UNAVAILABLE' | 'NOT_TAKEN' | 'IN_PROGRESS' | 'AWAITING_DECISION' | 'CONFIRMED';

/** What a student sees of one result: levels and score, never staff notes. */
export type StudentPlacementResult = {
  id: string;
  source: 'TEST' | 'MANUAL';
  score: number;
  createdAt: string;
  decidedAt: string | null;
  recommendedLevel: PlacementLevelRef;
  /** The level the student picked at registration. */
  chosenLevel: PlacementLevelRef | null;
  /** The level the academic office confirmed; null while awaiting a decision. */
  assignedLevel: PlacementLevelRef | null;
};

/** `GET /students/me/placement`. */
export type MyPlacement = {
  status: PlacementStatus;
  test: { id: string; title: string; description: string | null; durationMinutes: number | null; maxAttempts: number; questionCount: number } | null;
  attemptsUsed: number;
  canStart: boolean;
  activeAttempt: { id: string; startedAt: string; expiresAt: string | null } | null;
  intendedLevel: PlacementLevelRef | null;
  latest: StudentPlacementResult | null;
  history: StudentPlacementResult[];
};

/** `POST /students/me/placement/start` — questions carry no answer keys. */
export type PlacementSession = {
  attemptId: string;
  title: string;
  description: string | null;
  startedAt: string;
  durationMinutes: number | null;
  expiresAt: string | null;
  responses: Record<string, unknown>;
  questions: MyAssessmentDetail['questions'];
};

export type PlacementSubmitResult = StudentPlacementResult & { correct: number; total: number };

/** Staff view of one result (academic + super admin). */
export type StaffPlacementResult = StudentPlacementResult & {
  studentId: string;
  attemptId: string | null;
  recommendedLevelId: string;
  chosenLevelId: string | null;
  assignedLevelId: string | null;
  overrideReason: string | null;
  note: string | null;
  decidedBy: { id: string; firstName: string; lastName: string } | null;
};

export type PlacementQueueItem = StaffPlacementResult & {
  student: { id: string; studentCode: string; status: string; user: { firstName: string; lastName: string; email: string } };
};

/** `GET /students/:id/placements`. */
export type StudentPlacements = {
  student: {
    id: string;
    studentCode: string;
    status: string;
    placementScore: number | null;
    user: { firstName: string; lastName: string; email: string };
    intendedLevel: PlacementLevelRef | null;
    currentLevel: PlacementLevelRef | null;
  };
  results: StaffPlacementResult[];
};
