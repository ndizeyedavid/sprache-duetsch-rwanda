import { useState } from 'react';
import { FiBookmark, FiDownload, FiShare2, FiTrash2 } from 'react-icons/fi';
import { useApi } from '../../../hooks/useApi';
import { apiErrorMessage } from '../../../lib/api';
import { createRubricTemplate, deleteRubricTemplate, listRubricTemplates, updateRubricTemplate } from '../../../lib/feedback-bank';
import type { RubricTemplate } from '../../../lib/feedback-bank';
import type { RubricCriterion } from '../../assignments/homework/types';

type Props = { rubric: RubricCriterion[]; locked: boolean; onLoad: (criteria: RubricCriterion[]) => void };
const points = (rows: RubricCriterion[]) => rows.reduce((t, r) => t + Number(r.points || 0), 0);

/** Load a saved rubric (yours or a shared one) or save the current rubric for next time. */
export function RubricTemplates({ rubric, locked, onLoad }: Props) {
  const templates = useApi('rubric-templates', listRubricTemplates);
  const [saving, setSaving] = useState(false), [busy, setBusy] = useState(false);
  const [title, setTitle] = useState(''), [shared, setShared] = useState(false), [message, setMessage] = useState('');
  const canSave = rubric.length > 0 && rubric.every(r => r.title.trim() && Number(r.points) > 0);

  function load(t: RubricTemplate) {
    if (rubric.length && !confirm(`Replace the current rubric with “${t.title}”?`)) return;
    onLoad(t.criteria.map(c => ({ title: c.title, description: c.description ?? '', points: Number(c.points) })));
    setMessage(`Loaded “${t.title}”. Total points now ${points(t.criteria)}.`);
  }
  async function run(action: () => Promise<unknown>, done: string) {
    setBusy(true); setMessage('');
    try { await action(); templates.refetch(); setMessage(done); return true; }
    catch (e) { setMessage(apiErrorMessage(e, 'Could not update your rubric templates.')); return false; }
    finally { setBusy(false); }
  }
  async function save() {
    if (await run(() => createRubricTemplate({ title: title.trim(), criteria: rubric, isShared: shared }), shared ? 'Saved and shared with all teachers.' : 'Saved to your templates.')) { setSaving(false); setTitle(''); }
  }
  const list = templates.data ?? [];
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <details className="dropdown">
          <summary className={`btn btn-ghost btn-sm ${locked ? 'btn-disabled' : ''}`}><FiDownload aria-hidden />Load from template</summary>
          <ul className="dropdown-content menu z-20 mt-1 max-h-72 w-80 flex-nowrap overflow-y-auto rounded-box border border-base-300 bg-base-100 p-2">
            {templates.loading ? <li className="p-2 text-xs text-muted">Loading templates…</li> : !list.length ? <li className="p-2 text-xs text-muted">No templates yet. Build a rubric and save it.</li> : list.map(t => (
              <li key={t.id} className="flex-row items-center">
                <button type="button" className="min-w-0 flex-1 flex-col items-start gap-0" disabled={locked} onClick={() => load(t)}>
                  <span className="text-sm font-medium">{t.title}</span>
                  <span className="text-[0.6875rem] text-muted">{t.criteria.length} criteria · {points(t.criteria)} pts{t.isShared ? ' · Shared' : ''}{t.canEdit ? '' : ` · ${t.owner.firstName} ${t.owner.lastName}`}</span>
                </button>
                {t.canEdit ? <span className="flex gap-0 p-0">
                  <button type="button" className={`btn btn-ghost btn-xs btn-square ${t.isShared ? 'text-primary' : ''}`} disabled={busy} aria-label={t.isShared ? `Stop sharing ${t.title}` : `Share ${t.title} with all teachers`} title={t.isShared ? 'Shared · click to make private' : 'Share with all teachers'}
                    onClick={() => void run(() => updateRubricTemplate(t.id, { title: t.title, criteria: t.criteria, isShared: !t.isShared }), t.isShared ? 'Template is private again.' : 'Template shared with all teachers.')}><FiShare2 aria-hidden /></button>
                  <button type="button" className="btn btn-ghost btn-xs btn-square" disabled={busy} aria-label={`Delete ${t.title}`}
                    onClick={() => confirm(`Delete the template “${t.title}”?`) && void run(() => deleteRubricTemplate(t.id), 'Template deleted.')}><FiTrash2 aria-hidden /></button>
                </span> : null}
              </li>
            ))}
          </ul>
        </details>
        <button type="button" className="btn btn-ghost btn-sm" disabled={!canSave || busy} title={canSave ? undefined : 'Name every criterion first'} onClick={() => setSaving(v => !v)}><FiBookmark aria-hidden />Save as template</button>
      </div>
      {saving ? (
        <div className="flex flex-wrap items-center gap-2 rounded-field bg-base-200 p-2">
          <input className="input input-sm min-w-0 flex-1" aria-label="Template name" placeholder="e.g. A1 short writing" maxLength={120} value={title} onChange={e => setTitle(e.target.value)} />
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" className="checkbox checkbox-xs" checked={shared} onChange={e => setShared(e.target.checked)} />Share with all teachers</label>
          <button type="button" className="btn btn-sm" disabled={busy || title.trim().length < 2} onClick={() => void save()}>{busy ? 'Saving…' : 'Save'}</button>
        </div>
      ) : null}
      {message || templates.error ? <p role="status" className="text-xs text-muted">{message || templates.error}</p> : null}
    </div>
  );
}
