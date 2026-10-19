import { useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import { updateUser } from '../../lib/services';
import type { TeachingTeacher } from '../../lib/teaching';
import { addTeacherIntake,assignClassTeacher,assignTeachingLevels,removeTeacherIntake } from '../../lib/teaching';
import { approvedLevelIds,conflictClassName,teacherName } from './utils';

type Feedback = { tone: 'success' | 'error'; text: string } | null;

/**
 * Every Teachers-page write in one place: each action is a single click, shows a spinner on
 * the control that started it (`busyKey`), then refetches so all rows agree.
 */
export function useTeacherActions(refetch: () => void) {
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function run(key: string, work: () => Promise<unknown>, success: string, fallback: string) {
    setBusyKey(key);
    setFeedback(null);
    try {
      await work();
      setFeedback({ tone: 'success', text: success });
      refetch();
      return true;
    } catch (err) {
      const message = apiErrorMessage(err, fallback);
      const blocked = conflictClassName(message);
      setFeedback({ tone: 'error', text: blocked ? `${blocked} still runs on this level — move that class to another teacher first.` : message });
      return false;
    } finally {
      setBusyKey(null);
    }
  }

  const toggleLevel = (teacher: TeachingTeacher, levelId: string, code: string) => {
    const current = approvedLevelIds(teacher);
    const adding = !current.includes(levelId);
    const next = adding ? [...current, levelId] : current.filter((id) => id !== levelId);
    return run(`level:${teacher.id}:${levelId}`, () => assignTeachingLevels(teacher.id, next),
      adding ? `${teacherName(teacher)} can now teach ${code}.` : `${code} removed from ${teacherName(teacher)}.`, 'Could not update levels.');
  };

  /** Assign a class; approves the class's level first when the teacher does not hold it yet. */
  const assignClass = (teacher: TeachingTeacher, group: { id: string; name: string; levelId: string }) =>
    run(`class:${group.id}`, async () => {
      const levels = approvedLevelIds(teacher);
      if (!levels.includes(group.levelId)) await assignTeachingLevels(teacher.id, [...levels, group.levelId]);
      await assignClassTeacher(group.id, teacher.id);
    }, `${group.name} is now taught by ${teacherName(teacher)}.`, 'Could not assign this class.');

  const addIntake = (teacher: TeachingTeacher, intake: { id: string; name: string }) =>
    run(`intake:${intake.id}`, () => addTeacherIntake(teacher.id, intake.id), `${teacherName(teacher)} added to ${intake.name}.`, 'Could not add this intake.');

  const removeIntake = (teacher: TeachingTeacher, intake: { id: string; name: string }) =>
    run(`intake:${intake.id}`, () => removeTeacherIntake(teacher.id, intake.id), `${teacherName(teacher)} removed from ${intake.name}.`, 'Could not remove this intake.');

  const unassignClass = (group: { id: string; name: string }) =>
    run(`class:${group.id}`, () => assignClassTeacher(group.id, null), `${group.name} no longer has a teacher.`, 'Could not remove the teacher.');

  const activate = (teacher: TeachingTeacher) =>
    run(`status:${teacher.id}`, () => updateUser(teacher.id, { status: 'ACTIVE' }), `${teacherName(teacher)} is active and can sign in.`, 'Could not activate this account.');

  return { busyKey, feedback, clearFeedback: () => setFeedback(null), toggleLevel, assignClass, addIntake, removeIntake, unassignClass, activate };
}

export type TeacherActions = ReturnType<typeof useTeacherActions>;
