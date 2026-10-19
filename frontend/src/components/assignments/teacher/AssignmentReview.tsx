import { useCallback,useEffect,useRef,useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { useApi } from '../../../hooks/useApi';
import { apiErrorMessage } from '../../../lib/api';
import { exportHomework,getStaffHomework } from '../../../lib/homework';
import { ErrorBlock,LoadingBlock } from '../../common/PageState';
import { HomeworkGuide } from '../homework/HomeworkGuide';
import type { Homework } from '../homework/types';
import { AssignmentReviewHero } from './AssignmentReviewHero';
import { AssignmentRoster } from './AssignmentRoster';
import { ReviewSubmission } from './ReviewSubmission';

type Props = { id: string; onClose: () => void; onEdit: (assignment: Homework) => void };
export function AssignmentReview({ id, onClose, onEdit }: Props) {
  const detail = useApi(`staff-homework-${id}`, () => getStaffHomework(id));
  const [selected, setSelected] = useState<string | null>(null), [filter, setFilter] = useState('All'), [search, setSearch] = useState(''), [view, setView] = useState('review');
  const [exporting, setExporting] = useState(false), [exportError, setExportError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false);
  const dirty = useRef(false), initialized = useRef(false);
  const onWorking = useCallback((value: boolean, working: boolean) => { dirty.current = value; setBusy(working); }, []);
  useEffect(() => {
    if (initialized.current || !detail.data) return;
    initialized.current = true;
    setSelected(detail.data.submissions.find(s => s.status === 'SUBMITTED' && detail.data!.roster.some(r => r.id === s.studentId))?.id ?? null);
  }, [detail.data]);
  useEffect(() => {
    const leaving = (e: BeforeUnloadEvent) => { if (dirty.current) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', leaving); return () => window.removeEventListener('beforeunload', leaving);
  }, []);
  function navigate(action: () => void) { if (!busy && (!dirty.current || confirm('Discard your unsent grading changes?'))) { dirty.current = false; action(); } }
  async function download() { setExporting(true); setExportError(''); try { await exportHomework(id); } catch (e) { setExportError(apiErrorMessage(e, 'Could not export results.')); } finally { setExporting(false); } }
  const back = () => navigate(onClose);
  if (detail.loading) return <div className="space-y-5"><AssignmentReviewHero busy={busy} onBack={back} /><LoadingBlock label="Loading class submissions…" /></div>;
  if (!detail.data) return <div className="space-y-5"><AssignmentReviewHero busy={busy} onBack={back} /><ErrorBlock message={detail.error ?? 'Assignment unavailable'} onRetry={detail.refetch} /></div>;
  const { assignment: a, submissions, roster, files, extensions = [] } = detail.data;
  const rows = roster.map(student => ({ student, submission: submissions.find(s => s.studentId === student.id && s.revision > 0) }));
  const work = rows.flatMap(r => r.submission ? [r.submission] : []);
  const pending = work.filter(s => s.status === 'SUBMITTED');
  const graded = work.filter(s => s.status === 'GRADED');
  const missing = rows.filter(r => !r.submission).length;
  const lateOf = (s?: { lateness?: { isLate: boolean } | null; versions?: { isLate: boolean }[] }) => s?.lateness ? s.lateness.isLate : !!s?.versions?.[0]?.isLate;
  const late = work.filter(s => lateOf(s)).length;
  const current = submissions.find(s => s.id === selected);
  const next = pending.find(s => s.id !== selected);
  const students = rows.filter(({ student: r, submission: s }) => `${r.user.firstName} ${r.user.lastName} ${r.studentCode}`.toLowerCase().includes(search.toLowerCase()) && (filter === 'All' || filter === 'Missing' ? filter === 'All' || !s : filter === 'Late' ? lateOf(s) : filter === 'Extended' ? extensions.some(e => e.studentId === r.id) : s?.status === filter));
  return <div className="space-y-5">
    <AssignmentReviewHero assignment={a} assigned={roster.length} extensions={extensions.length} busy={busy} exporting={exporting} onBack={back}
      onDownload={() => void download()} onEdit={() => navigate(() => onEdit({ ...a, submissions }))} footer={<>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[{ label: 'Awaiting review', count: pending.length, value: 'SUBMITTED' }, { label: 'Graded', count: graded.length, value: 'GRADED' }, { label: 'Not submitted', count: missing, value: 'Missing' }, { label: 'Late submissions', count: late, value: 'Late' }].map(m => <button key={m.value} className="rounded-field p-2 text-left hover:bg-base-200" onClick={() => setFilter(m.value)}><span className="block text-xl font-semibold">{m.count}</span><span className="mt-1 block text-xs text-muted">{m.label}</span></button>)}</div>
      {graded.length ? <p className="mt-3 text-xs text-muted">Average grade: {(graded.reduce((sum, s) => sum + Number(s.score), 0) / graded.length).toFixed(1)}/{a.maxPoints} · Based on {graded.length} reviewed {graded.length === 1 ? 'submission' : 'submissions'}.</p> : null}
      <details className="mt-4 text-xs"><summary className="cursor-pointer font-semibold">Task instructions & expectations</summary><div className="mt-4 grid gap-4 lg:grid-cols-2"><p className="whitespace-pre-wrap text-sm leading-7 text-muted">{a.instructions}</p><HomeworkGuide assignment={a} /></div></details>
    </>} />
    {notice ? <p role="status" className="alert alert-success alert-soft text-xs">{notice}</p> : null}{exportError || detail.error ? <p role="alert" className="alert alert-error alert-soft text-xs">{exportError || detail.error}</p> : null}
    <div className="flex flex-wrap items-center gap-3"><div className="flex gap-2" aria-label="Submission views">{[['review', 'Review work'], ['results', 'Class results']].map(([value, label]) => <button key={value} aria-pressed={view === value} className={`btn btn-sm ${view === value ? 'btn-neutral' : 'btn-ghost'}`} onClick={() => navigate(() => setView(value))}>{label}</button>)}</div><label className="input input-sm min-w-0 flex-1 sm:max-w-sm"><input aria-label="Search assignment students" placeholder="Search name or student ID…" value={search} onChange={e => setSearch(e.target.value)} /></label><select aria-label="Filter submissions" className="select select-sm w-full sm:w-48" value={filter} onChange={e => setFilter(e.target.value)}><option>All</option><option value="SUBMITTED">Awaiting review</option><option value="GRADED">Graded</option><option value="RETURNED">Revision requested</option><option value="Missing">Not submitted</option><option value="Late">Late work</option><option value="Extended">Has an extension</option></select></div>
    {view === 'results' ? <section className="card border border-base-300 bg-base-100"><AssignmentRoster rows={students} selected={selected} onSelect={id => navigate(() => { setSelected(id); setView('review'); })} busy={busy} table maxPoints={a.maxPoints} extensions={extensions} assignment={a} onChanged={detail.refetch} /></section> : <div className="grid items-start gap-5 lg:grid-cols-[16.25rem_minmax(0,1fr)]"><aside className="card overflow-hidden border border-base-300 bg-base-100"><div className="p-4"><h2 className="text-sm font-semibold">Class submissions</h2><p className="mt-1 text-xs text-muted">{students.length} students · Drafts stay private · Extend deadlines in Class results</p></div><AssignmentRoster rows={students} selected={selected} onSelect={id => navigate(() => setSelected(id))} busy={busy} maxPoints={a.maxPoints} extensions={extensions} /></aside><div className="min-w-0 space-y-3">
      {current ? <><div className="flex items-center justify-between gap-3"><p className="text-xs text-muted">{pending.length} awaiting review</p>{next ? <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => navigate(() => setSelected(next.id))}>Next to review<FiArrowRight aria-hidden /></button> : null}</div><ReviewSubmission key={`${current.id}-${current.status}-${current.revision}`} assignment={a} submission={current} files={files} onWorking={onWorking} onRefresh={detail.refetch} hasNext={!!next} onSaved={goNext => { dirty.current = false; setBusy(false); setNotice(goNext ? 'Feedback sent. The next response is ready.' : 'Feedback sent.'); if (goNext && next) setSelected(next.id); detail.refetch(); }} /></> : <section className="card border border-base-300 bg-base-100 p-6"><h2 className="font-semibold">{pending.length ? 'Select a response to review' : 'You’re up to date'}</h2><p className="mt-3 text-sm leading-7 text-muted">{pending.length ? 'Select a student from the list, review their answers, and send a grade or request a revision.' : 'New submissions will appear here. Use Class results to see graded work and students who haven’t submitted.'}</p></section>}
    </div></div>}
  </div>;
}
