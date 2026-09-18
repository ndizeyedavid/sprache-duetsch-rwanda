import { useState } from 'react';
import type { FormEvent } from 'react';
import { FiAlertCircle, FiSend } from 'react-icons/fi';
import { apiErrorMessage } from '../../lib/api';
import { humanize, postFeedEvent } from '../../lib/services';
import { POST_TYPES } from './constants';
import { initials } from './utils';

type Props = { displayName: string; avatarUrl?: string | null; onPosted: () => void };

export function ComposerCard({ displayName, avatarUrl, onPosted }: Props) {
 const [title, setTitle] = useState('');
 const [body, setBody] = useState('');
 const [type, setType] = useState('ANNOUNCEMENT');
 const [error, setError] = useState<string | null>(null);
 const [posting, setPosting] = useState(false);
 const [expanded, setExpanded] = useState(false);

 async function handleSubmit(e: FormEvent) {
 e.preventDefault();
 if (!title.trim()) { setError('Add a headline.'); return; }
 setError(null); setPosting(true);
 try {
 await postFeedEvent({ type, title: title.trim(), body: body.trim() || undefined });
 setTitle(''); setBody(''); setExpanded(false); onPosted();
 } catch (err) { setError(apiErrorMessage(err, 'Could not publish.')); } finally { setPosting(false); }
 }

 return (
 <div className="overflow-hidden rounded-box border border-line bg-base-100">
 <form onSubmit={handleSubmit} className="p-4">
 <div className="flex gap-3">
 {avatarUrl ? (
 <img src={avatarUrl} alt={displayName} className="size-9 shrink-0 rounded-full object-cover" />
 ) : (
 <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">{initials(displayName)}</span>
 )}
  <button
  type="button"
  onClick={() => setExpanded(true)}
  className={`flex-1 rounded-full border px-4 py-2.5 text-left text-sm ${expanded ? 'hidden' : 'border-line bg-base-200 text-muted hover:bg-base-300'}`}
  >
  Share an update with your class…
  </button>
  <div className={`flex-1 ${expanded ? '' : 'hidden'}`}>
  <input value={title} onChange={(e) => setTitle(e.currentTarget.value)} placeholder="Headline — e.g. Mid-term schedule update" className="input w-full rounded-box border-line bg-base-100 text-sm" />
  <textarea value={body} onChange={(e) => setBody(e.currentTarget.value)} placeholder="Add details (optional)… Shift+Enter for new line" rows={2} className="textarea mt-2 w-full rounded-box border-line bg-base-100 text-sm" />
  <div className="mt-3 flex flex-wrap items-center gap-2">
  <select value={type} onChange={(e) => setType(e.currentTarget.value)} className="select rounded-full border-line bg-base-100 text-sm">
  {POST_TYPES.map((t) => <option key={t} value={t}>{humanize(t)}</option>)}
  </select>
  <span className="ml-auto flex gap-2">
  <button type="button" onClick={() => { setExpanded(false); setError(null); }} className="btn btn-sm rounded-full border-line bg-base-100">Cancel</button>
  <button type="submit" disabled={posting} className="btn btn-sm gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
  {posting ? <span className="loading loading-spinner loading-xs" /> : <FiSend aria-hidden />}Publish
  </button>
  </span>
  </div>
  </div>
 </div>
 {error ? <p role="alert" className="mt-2 flex gap-2 rounded-box bg-coral-soft px-3 py-2 text-xs font-medium text-[#D8482F]"><FiAlertCircle aria-hidden className="mt-0.5 shrink-0" />{error}</p> : null}
 </form>
 </div>
 );
}
