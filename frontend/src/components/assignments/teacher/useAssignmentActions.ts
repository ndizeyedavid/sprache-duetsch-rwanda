import { useState } from 'react';
import { apiErrorMessage } from '../../../lib/api';
import { changeHomeworkStatus,deleteHomework,duplicateHomework,exportHomework } from '../../../lib/homework';
import type { Homework } from '../homework/types';

export function useAssignmentActions(refetch: () => void, onEdit: (id: string) => void) {
  const [busyId, setBusyId] = useState<string | null>(null), [error, setError] = useState(''), [notice, setNotice] = useState('');
  async function run(a: Homework, action: 'publish' | 'draft' | 'archive' | 'duplicate' | 'delete' | 'export') {
    if (busyId) return;
    if (action === 'delete' && !confirm(`Delete draft “${a.title}”? This cannot be undone.`)) return;
    if ((action === 'archive' || action === 'draft') && !confirm(`Hide “${a.title}” from students? Saved submissions will be kept.`)) return;
    setBusyId(a.id); setError(''); setNotice('');
    try {
      if (action === 'duplicate') { const copy = await duplicateHomework(a.id); refetch(); onEdit(copy.id); return; }
      if (action === 'export') await exportHomework(a.id);
      else if (action === 'delete') await deleteHomework(a.id);
      else await changeHomeworkStatus(a.id, action === 'publish' ? 'PUBLISHED' : action === 'draft' ? 'DRAFT' : 'ARCHIVED');
      if (action !== 'export') { refetch(); setNotice(action === 'delete' ? 'Draft deleted.' : action === 'publish' ? 'Assignment published. Scheduled tasks open at their release time.' : 'Assignment hidden. Existing submissions are preserved.'); }
    } catch (e) { setError(apiErrorMessage(e, 'Could not update assignment.')); }
    finally { setBusyId(null); }
  }
  return { busyId, error, notice, run };
}
