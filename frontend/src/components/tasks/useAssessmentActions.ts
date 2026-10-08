import { useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import { deleteAssessment, updateAssessment } from '../../lib/services';
import type { TaskItem } from './task-types';

/** Publish, unpublish and delete for quizzes and tests. */
export function useAssessmentActions(refetch: () => void) {
  const [busyId, setBusyId] = useState<string | null>(null), [error, setError] = useState(''), [notice, setNotice] = useState('');
  async function run(item: TaskItem, action: 'publish' | 'unpublish' | 'delete') {
    if (busyId) return;
    if (action === 'delete' && !confirm(`Delete “${item.title}”? Students’ attempts will be removed. This cannot be undone.`)) return;
    setBusyId(item.id); setError(''); setNotice('');
    try {
      if (action === 'delete') await deleteAssessment(item.id);
      else await updateAssessment(item.id, { isPublished: action === 'publish' });
      refetch();
      setNotice(action === 'delete' ? 'Deleted.' : action === 'publish' ? 'Published. Students can see it now.' : 'Moved back to drafts.');
    } catch (e) { setError(apiErrorMessage(e, 'Could not update.')); }
    finally { setBusyId(null); }
  }
  return { busyId, error, notice, run };
}
