import { listMyHomework } from '../../lib/homework';
import { getMyAssignments } from '../../lib/services';
export type FeedItem = { id: string; title: string; course: string; context: string; kind: string; status: string; dueAt: string | null; points: number; score: number | null; minutes?: number; isHomework: boolean };
export async function getAssignmentFeed(): Promise<FeedItem[]> {
  const [homework, legacy] = await Promise.all([listMyHomework(), getMyAssignments()]);
  const items: FeedItem[] = homework.map(a => ({ id: `HW-${a.id}`, title: a.title, course: a.classGroup.level.code, context: a.classGroup.name, kind: 'Homework', status: a.submissions?.[0]?.status ?? 'NOT_STARTED', dueAt: a.dueAt, points: Number(a.maxPoints), score: a.submissions?.[0]?.score == null ? null : Number(a.submissions[0].score), minutes: a.estimatedMinutes, isHomework: true }));
  items.push(...legacy.map(a => ({ id: a.id, title: a.title, course: a.levelCode, context: a.lessonTitle ?? a.levelTitle, kind: a.source === 'ACTIVITY' ? 'Lesson activity' : a.type.replaceAll('_', ' ').toLowerCase(), status: a.status, dueAt: a.dueAt, points: a.maxScore, score: a.score, isHomework: false })));
  return items.sort((a, b) => (a.dueAt ? new Date(a.dueAt).getTime() : Infinity) - (b.dueAt ? new Date(b.dueAt).getTime() : Infinity) || a.title.localeCompare(b.title));
}
export const feedBucket = (item: FeedItem): 'To do' | 'Submitted' | 'Feedback' => item.status === 'GRADED' || item.status === 'RETURNED' ? 'Feedback' : item.status === 'SUBMITTED' ? 'Submitted' : 'To do';
