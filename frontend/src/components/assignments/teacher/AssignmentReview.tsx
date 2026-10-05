import { useState } from 'react';
import { FiArrowLeft, FiEdit2 } from 'react-icons/fi';
import { useApi } from '../../../hooks/useApi';
import { getStaffHomework } from '../../../lib/homework';
import { LoadingBlock, ErrorBlock } from '../../common/PageState';
import { ReviewSubmission } from './ReviewSubmission';
import { HomeworkGuide } from '../homework/HomeworkGuide';
import { statusLabels } from '../homework/format';
import type { Homework } from '../homework/types';
export function AssignmentReview({ id, onClose, onEdit }: { id: string; onClose: () => void; onEdit: (assignment: Homework) => void }) {
  const detail = useApi(`staff-homework-${id}`, () => getStaffHomework(id));
  const [selected, setSelected] = useState<string | null>(null), [filter, setFilter] = useState('All');
  if (detail.loading) return <LoadingBlock label="Loading class submissions…" />;
  if (detail.error || !detail.data) return <ErrorBlock message={detail.error ?? 'Assignment unavailable'} onRetry={detail.refetch} />;
  const { assignment: a, submissions, roster, files } = detail.data;
  const current = submissions.find(s => s.id === selected);
  const students = roster.filter(r => { const s = submissions.find(v => v.studentId === r.id); return filter === 'All' || filter === 'Missing' ? filter === 'All' || !s || !s.revision : s?.status === filter; });
  return <div className="space-y-5"><button className="btn btn-ghost btn-sm" onClick={onClose}><FiArrowLeft />All assignments</button><section className="card border border-base-300/70 bg-base-100 p-6"><div className="flex flex-wrap justify-between gap-4"><div><p className="text-xs text-base-content/50">{a.classGroup.level.code} · {a.classGroup.name} · {a.status.toLowerCase()}</p><h1 className="mt-2 text-2xl font-bold">{a.title}</h1><p className="mt-2 text-xs text-base-content/60">{submissions.filter(s => s.status === 'SUBMITTED').length} awaiting review · {submissions.filter(s => s.status === 'GRADED').length} graded · {roster.length} assigned students</p></div><button className="btn btn-sm rounded-full" onClick={() => onEdit({ ...a, submissions })}><FiEdit2 />Edit task</button></div></section>
    <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)]"><aside className="card overflow-hidden border border-base-300/70 bg-base-100"><div className="space-y-3 p-4"><h2 className="text-sm font-semibold">Class submissions</h2><select aria-label="Filter submissions" className="select select-sm w-full" value={filter} onChange={e => setFilter(e.target.value)}><option>All</option><option value="SUBMITTED">Awaiting review</option><option value="GRADED">Graded</option><option value="RETURNED">Revision requested</option><option value="Missing">Not submitted</option></select></div>{students.map(r => { const s = submissions.find(v => v.studentId === r.id); return <button key={r.id} disabled={!s?.revision} className={`w-full border-t border-base-300/60 p-4 text-left ${s?.id === selected ? 'bg-primary/5' : 'hover:bg-base-200/50'} disabled:opacity-60`} onClick={() => setSelected(s?.id ?? null)}><p className="text-xs font-semibold">{r.user.firstName} {r.user.lastName}</p><p className="mt-1 text-[10px] text-base-content/55">{s?.revision ? statusLabels[s.status] : 'Not submitted'}</p></button>; })}{!students.length ? <p className="p-5 text-xs text-base-content/50">No students match this filter.</p> : null}</aside><div className="min-w-0">{current ? <ReviewSubmission key={`${current.id}-${current.status}-${current.revision}`} assignment={a} submission={current} files={files} onSaved={detail.refetch} /> : <div className="grid gap-4 xl:grid-cols-2"><section className="card border border-base-300/70 bg-base-100 p-6"><h2 className="font-semibold">Select a submitted response</h2><p className="mt-3 text-sm leading-7 text-base-content/60">Read the work, score it against your expectations, and send useful feedback. Students’ unfinished drafts stay private.</p><h3 className="mb-3 mt-6 text-sm font-semibold">Task instructions</h3><p className="whitespace-pre-wrap text-sm leading-7 text-base-content/70">{a.instructions}</p></section><HomeworkGuide assignment={a} /></div>}</div></div>
  </div>;
}
