import { useState } from 'react';
import { FiBookmark, FiMessageSquare, FiTrash2 } from 'react-icons/fi';
import { useApi } from '../../../hooks/useApi';
import { apiErrorMessage } from '../../../lib/api';
import { createFeedbackComment, deleteFeedbackComment, listFeedbackComments, markFeedbackCommentUsed } from '../../../lib/feedback-bank';
import type { FeedbackComment } from '../../../lib/feedback-bank';

type Props = { feedback: string; disabled: boolean; onInsert: (text: string) => void };

/** Your saved feedback snippets: insert one into the feedback box, or save what you just wrote. */
export function CommentBank({ feedback, disabled, onInsert }: Props) {
  const comments = useApi('feedback-comments', listFeedbackComments);
  const [query, setQuery] = useState(''), [category, setCategory] = useState(''), [saving, setSaving] = useState(false);
  const [newCategory, setNewCategory] = useState(''), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  const all = comments.data ?? [];
  const categories = [...new Set(all.flatMap(c => c.category ? [c.category] : []))].sort();
  const list = all.filter(c => (!category || c.category === category) && `${c.text} ${c.category ?? ''}`.toLowerCase().includes(query.trim().toLowerCase()));

  function insert(c: FeedbackComment) {
    onInsert(c.text);
    void markFeedbackCommentUsed(c.id).then(comments.refetch).catch(() => {});
  }
  async function run(action: () => Promise<unknown>, done: string) {
    setBusy(true); setMessage('');
    try { await action(); comments.refetch(); setMessage(done); return true; }
    catch (e) { setMessage(apiErrorMessage(e, 'Could not update your comment bank.')); return false; }
    finally { setBusy(false); }
  }
  async function save() {
    if (await run(() => createFeedbackComment({ text: feedback.trim(), category: newCategory.trim() || null }), 'Saved to your comment bank.')) { setSaving(false); setNewCategory(''); }
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <details className="dropdown">
          <summary className={`btn btn-ghost btn-xs ${disabled ? 'btn-disabled' : ''}`}><FiMessageSquare aria-hidden />Comment bank{all.length ? ` (${all.length})` : ''}</summary>
          <div className="dropdown-content z-20 mt-1 w-80 max-w-[85vw] space-y-2 rounded-box border border-base-300 bg-base-100 p-2">
            <div className="flex gap-1">
              <input className="input input-xs min-w-0 flex-1" aria-label="Search saved comments" placeholder="Search…" value={query} onChange={e => setQuery(e.target.value)} />
              {categories.length ? <select className="select select-xs w-28" aria-label="Comment category" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">All</option>{categories.map(c => <option key={c}>{c}</option>)}
              </select> : null}
            </div>
            <ul className="max-h-60 space-y-1 overflow-y-auto">
              {comments.loading ? <li className="p-2 text-xs text-muted">Loading…</li> : !list.length ? <li className="p-2 text-xs text-muted">{all.length ? 'No comments match.' : 'Write feedback, then use “Save to bank” to reuse it.'}</li> : list.map(c => (
                <li key={c.id} className="flex items-start gap-1">
                  <button type="button" className="min-w-0 flex-1 rounded-field p-2 text-left text-xs leading-5 hover:bg-base-200" disabled={disabled} onClick={() => insert(c)}>
                    {c.category ? <span className="badge badge-ghost badge-xs mr-1">{c.category}</span> : null}{c.text}
                  </button>
                  <button type="button" className="btn btn-ghost btn-xs btn-square" disabled={busy} aria-label="Delete saved comment"
                    onClick={() => confirm('Delete this saved comment?') && void run(() => deleteFeedbackComment(c.id), 'Comment deleted.')}><FiTrash2 aria-hidden /></button>
                </li>
              ))}
            </ul>
          </div>
        </details>
        <button type="button" className="btn btn-ghost btn-xs" disabled={disabled || busy || !feedback.trim()} onClick={() => setSaving(v => !v)}><FiBookmark aria-hidden />Save to bank</button>
      </div>
      {saving ? (
        <div className="flex flex-wrap items-center gap-2 rounded-field bg-base-200 p-2">
          <input className="input input-xs min-w-0 flex-1" aria-label="Comment category" placeholder="Category (optional), e.g. Grammar" maxLength={60} list="comment-categories" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
          <datalist id="comment-categories">{categories.map(c => <option key={c} value={c} />)}</datalist>
          <button type="button" className="btn btn-xs" disabled={busy} onClick={() => void save()}>{busy ? 'Saving…' : 'Save feedback'}</button>
        </div>
      ) : null}
      {message || comments.error ? <p role="status" className="text-xs text-muted">{message || comments.error}</p> : null}
    </div>
  );
}
