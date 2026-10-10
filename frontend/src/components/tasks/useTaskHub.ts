import { useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { listStaffHomework } from '../../lib/homework';
import { listAssessments, listClasses, listLevels } from '../../lib/services';
import { listMyTeachingLevels } from '../../lib/teaching';
import { dateLabel, responseLabels } from '../assignments/homework/format';
import type { TaskItem } from './task-types';

/** Homework, quizzes and tests in one list. Teachers only see levels they teach. */
export function useTaskHub(isTeacher: boolean) {
  const homework = useApi('staff-homework', listStaffHomework);
  const assessments = useApi('assessments-list', listAssessments);
  const levels = useApi(`task-levels-${isTeacher ? 'mine' : 'all'}`, isTeacher ? listMyTeachingLevels : listLevels);
  const classes = useApi('assignment-classes', listClasses);
  const allowed = useMemo(() => new Set((levels.data ?? []).map(l => l.id)), [levels.data]);

  const items = useMemo<TaskItem[]>(() => {
    const fromHomework = (homework.data ?? []).map((h): TaskItem => {
      const count = h.questions?.length ?? 0;
      return { key: `homework:${h.id}`, source: 'homework', id: h.id, kind: 'HOMEWORK', title: h.title, homework: h,
        scope: `${h.classGroup.level.code} · ${h.classGroup.name}`, scopeId: h.classGroupId, status: h.status,
        when: h.dueAt, whenLabel: h.dueAt ? `Due ${dateLabel(h.dueAt)}` : 'No due date',
        summary: `${count ? `${count} questions` : responseLabels[h.responseType]} · ${Number(h.maxPoints)} pts`, toReview: h.summary?.toReview ?? 0 };
    });
    const levelCode = new Map((levels.data ?? []).map(l => [l.id, l.code]));
    const fromAssessments = (assessments.data ?? []).filter(a => !isTeacher || allowed.has(a.levelId)).map((a): TaskItem => {
      const count = a.questions?.length ?? 0;
      return { key: `assessment:${a.id}`, source: 'assessment', id: a.id, kind: a.type === 'QUIZ' ? 'QUIZ' : 'TEST', title: a.title, assessment: a,
        scope: levelCode.get(a.levelId) ?? 'Level', scopeId: a.levelId, status: a.isPublished ? 'PUBLISHED' : 'DRAFT',
        when: a.availableUntil, whenLabel: a.availableUntil ? `Closes ${dateLabel(a.availableUntil)}` : 'Always open',
        summary: [count ? `${count} questions` : null, a.durationMinutes ? `${a.durationMinutes} min` : 'No time limit', `pass ${Number(a.passMark)}%`].filter(Boolean).join(' · '), toReview: 0 };
    });
    return [...fromHomework, ...fromAssessments].sort((a, b) => b.toReview - a.toReview || (a.status === 'DRAFT' ? -1 : 0) - (b.status === 'DRAFT' ? -1 : 0));
  }, [homework.data, assessments.data, levels.data, allowed, isTeacher]);

  // The classes endpoint already limits teachers to their own classes.
  const classOptions = (classes.data ?? []).map(c => ({ id: c.id, label: `${c.level.code} · ${c.name}` }));
  const levelOptions = (levels.data ?? []).map(l => ({ id: l.id, label: `${l.code} · ${l.title}` }));
  const refetch = () => { homework.refetch(); assessments.refetch(); };
  return {
    items, classOptions, levelOptions, refetch,
    loading: homework.loading || assessments.loading || levels.loading,
    fetching: homework.fetching || assessments.fetching,
    error: homework.error ?? assessments.error ?? levels.error ?? classes.error,
  };
}
