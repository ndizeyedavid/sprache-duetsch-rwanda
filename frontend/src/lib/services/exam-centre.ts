import { apiDelete,apiGet,apiPost,apiPut } from '../api';

export type PaperAudio = { id?: string; title: string; url: string };
export type PaperResults = { attempts: number; best: { score: number; total: number }; last: { score: number; total: number; createdAt: string } | null };

export type ExamPaperCard = {
  id: string; title: string; description: string | null; provider: string; edition: string | null;
  fileUrl: string | null; fileName: string | null; sizeBytes: number | null; sourceUrl: string | null; hasAnswerKey: boolean;
  /** Listening recordings uploaded with the paper, in play order. */
  audio: PaperAudio[];
  /** The student's own answer-sheet results for this paper. */
  results: PaperResults | null;
};
export type ExamCentreTest = {
  id: string; title: string; type: 'MODULE_TEST' | 'FINAL_EXAM'; durationMinutes: number | null; passMark: number; questions: number;
  opensAfter: { lessonId: string; title: string; order: number; completed: boolean } | null;
  latest: { status: string; score: number | null; maxScore: number; passed: boolean | null } | null;
};
export type ExamCentreLevel = { id: string; code: string; title: string; levelLabel: string; papers: ExamPaperCard[]; tests: ExamCentreTest[] };
export type ExamCentre = { currentLevelCode: string | null; levels: ExamCentreLevel[]; locked: { code: string; title: string }[] };

export type SheetPart = { title: string; options: string[]; first: number; count: number };
export type SheetHistory = { id: string; score: number; total: number; sections: { name: string; score: number; total: number }[]; createdAt: string };
export type PaperSheet = {
  id: string; title: string; provider: string; fileUrl: string | null; fileName: string | null; sourceUrl: string | null;
  level: { code: string; title: string }; parts: SheetPart[]; audio: PaperAudio[]; history: SheetHistory[];
};
export type SheetMark = {
  score: number; total: number; percentage: number;
  sections: { name: string; score: number; total: number }[];
  parts: { title: string; score: number; total: number; items: { number: number; given: string | null; answer: string; correct: boolean }[] }[];
  attemptId: string; createdAt: string;
};

/** Exam papers and tests of every course the student has paid for. */
export const getMyExamCentre = () => apiGet<ExamCentre>('/exam-papers/my');
export const getMyPaperSheet = (id: string) => apiGet<PaperSheet>(`/exam-papers/my/${id}/sheet`);
export const checkMyPaperSheet = (id: string, responses: (string | null)[][]) => apiPost<SheetMark>(`/exam-papers/my/${id}/check`, { responses });

/** Staff (Resources → Exam papers). `answerKey` is the text format "Lesen Teil 1 | a b c | b b c b a". */
export type StaffExamPaper = Omit<ExamPaperCard, 'hasAnswerKey' | 'results'> & {
  levelId: string; order: number; isPublished: boolean; answerKey: string; level: { code: string; title: string };
  _count: { attempts: number };
};
export type ExamPaperInput = Omit<StaffExamPaper, 'id' | 'level' | '_count'>;
export const listExamPapers = () => apiGet<StaffExamPaper[]>('/exam-papers');
export const createExamPaper = (body: ExamPaperInput) => apiPost<StaffExamPaper>('/exam-papers', body);
export const updateExamPaper = (id: string, body: ExamPaperInput) => apiPut<StaffExamPaper>(`/exam-papers/${id}`, body);
export const deleteExamPaper = (id: string) => apiDelete<{ message: string }>(`/exam-papers/${id}`);
