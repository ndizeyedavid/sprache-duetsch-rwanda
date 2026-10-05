import type { MyAssessment } from '../../lib/services';
import type { Homework } from '../assignments/homework/types';
import { TYPE_LABEL } from './constants';
export type ResultState = 'ready' | 'waiting' | 'returned' | 'started' | 'new';
export type GradeEntry = { id: string; title: string; course: string; kind: string; score: number | null; max: number; state: ResultState; feedback: string | null; date: string | null; passMark: number | null; href: string };
export const resultLabels: Record<ResultState, string> = { ready: 'Graded', waiting: 'Awaiting review', returned: 'Changes requested', started: 'In progress', new: 'Not started' };
export function buildGradeEntries(assessments: MyAssessment[], homework: Homework[]): GradeEntry[] {
  const exams: GradeEntry[] = assessments.map(a => ({ id: `ASM-${a.id}`, title: a.title, course: a.level?.code ?? a.levelId, kind: TYPE_LABEL[a.type] ?? a.type, score: a.bestScore, max: a.maxScore, state: a.bestScore !== null ? 'ready' : a.latestStatus === 'SUBMITTED' ? 'waiting' : a.latestStatus === 'IN_PROGRESS' ? 'started' : 'new', feedback: null, date: a.latestSubmittedAt, passMark: a.passMark, href: `/assignments/ASM-${a.id}` }));
  const tasks: GradeEntry[] = homework.map(a => { const s = a.submissions?.[0]; return { id: `HW-${a.id}`, title: a.title, course: a.classGroup.level.code, kind: 'Homework', score: s?.status === 'GRADED' && s.score !== null ? Number(s.score) : null, max: Number(a.maxPoints), state: s?.status === 'GRADED' ? 'ready' : s?.status === 'RETURNED' ? 'returned' : s?.status === 'SUBMITTED' ? 'waiting' : s ? 'started' : 'new', feedback: s?.feedback ?? null, date: s?.submittedAt ?? null, passMark: null, href: `/assignments/HW-${a.id}` }; });
  return [...exams, ...tasks].sort((a,b) => (b.date ? Date.parse(b.date) : 0) - (a.date ? Date.parse(a.date) : 0));
}
export function resultsCsv(rows: GradeEntry[]) {
  const cell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [['Course','Assignment','Type','Points','Maximum','Status'], ...rows.map(r => [r.course,r.title,r.kind,r.score,r.max,resultLabels[r.state]])].map(row => row.map(cell).join(',')).join('\n');
}
