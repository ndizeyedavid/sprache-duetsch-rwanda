import { useEffect, useMemo, useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import { getStaffHomework, saveHomework } from '../../lib/homework';
import { createAssessment, getAssessment, updateAssessment } from '../../lib/services';
import { emptyDraft, fromAssessment, fromHomework, toAssessmentBody, toHomeworkInput } from './task-draft';
import type { TaskDraft, TaskKind, TaskStatus, TaskTarget } from './task-types';
import { stepIssues } from './task-validation';

/** Loads, edits and saves one homework, quiz or test through its own engine. */
export function useTaskStudio(target: TaskTarget, scope: { classGroupId?: string; levelId?: string }) {
  const [draft, setDraft] = useState<TaskDraft>(() => emptyDraft(target.kind, scope));
  const [saved, setSaved] = useState<string>(() => JSON.stringify(draft));
  const [loading, setLoading] = useState(!!target.id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (!target.id) return;
    let active = true;
    const load = target.kind === 'HOMEWORK'
      ? getStaffHomework(target.id).then(d => { if (active) setLocked(d.submissions.some(s => s.revision > 0)); return fromHomework({ ...d.assignment, submissions: d.submissions }); })
      : getAssessment(target.id).then(fromAssessment);
    load.then(next => { if (active) { setDraft(next); setSaved(JSON.stringify(next)); } })
      .catch(e => { if (active) setError(apiErrorMessage(e, 'Could not open this item.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [target.id, target.kind]);

  const issues = useMemo(() => stepIssues(draft), [draft]);
  const dirty = JSON.stringify(draft) !== saved;
  const update = (patch: Partial<TaskDraft>) => setDraft(d => ({ ...d, ...patch }));
  /** Switching kind while creating keeps the shared fields (title, instructions, questions). */
  const switchKind = (kind: TaskKind) => setDraft(d => ({ ...emptyDraft(kind, scope), title: d.title, instructions: d.instructions, questions: d.questions,
    homeworkMode: d.questions.length ? 'questions' : 'work', classGroupId: d.classGroupId, levelId: d.levelId }));

  async function save(status: TaskStatus): Promise<{ id: string; kind: TaskKind } | null> {
    const next = { ...draft, status };
    setSaving(true); setError('');
    try {
      const id = next.kind === 'HOMEWORK'
        ? (await saveHomework(toHomeworkInput(next), target.id)).id
        : (target.id ? await updateAssessment(target.id, toAssessmentBody(next)) : await createAssessment(toAssessmentBody(next))).id;
      setDraft(next); setSaved(JSON.stringify(next));
      return { id, kind: next.kind };
    } catch (e) { setError(apiErrorMessage(e, 'Could not save. Your changes are still here.')); return null; }
    finally { setSaving(false); }
  }

  return { draft, update, switchKind, issues, dirty, loading, saving, error, locked, save };
}
