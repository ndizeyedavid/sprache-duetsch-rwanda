import { FiBookOpen,FiSearch } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import { AssignmentHero } from '../../components/assignments/AssignmentHero';
import { AssignmentRow } from '../../components/assignments/AssignmentRow';
import { feedBucket,getAssignmentFeed } from '../../components/assignments/assignment-feed';
import { ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
const tabs = ['All', 'To do', 'Submitted', 'Feedback'];
export function Assignments() {
  const data = useApi('assignment-feed', getAssignmentFeed);
  const [params, setParams] = useSearchParams();
  const tab = tabs.includes(params.get('tab') ?? '') ? params.get('tab')! : 'All';
  const q = params.get('q') ?? '', course = params.get('course') ?? '', kind = params.get('kind') ?? '';
  const change = (key: string, value: string) => setParams(p => { const n = new URLSearchParams(p); if (value) n.set(key, value); else n.delete(key); return n; }, { replace: true });
  if (data.loading) return <LoadingBlock label="Preparing your assignments…" />;
  if (data.error) return <ErrorBlock message={data.error} onRetry={data.refetch} />;
  const items = data.data ?? [];
  const filtered = items.filter(i => (tab === 'All' || feedBucket(i) === tab) && (!course || course === i.course) && (!kind || (kind === 'homework' ? i.isHomework : !i.isHomework)) && `${i.title} ${i.context} ${i.course}`.toLowerCase().includes(q.toLowerCase()));
  return <div className="journey-enter space-y-5">
    <AssignmentHero items={items} />
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-1" role="tablist" aria-label="Assignment status">{tabs.map(t => <button key={t} role="tab" aria-selected={tab === t} onClick={() => change('tab', t === 'All' ? '' : t)} className={`btn btn-sm rounded-full ${tab === t ? 'btn-neutral' : 'btn-ghost'}`}>{t}<span className="text-[10px] opacity-60">{items.filter(i => t === 'All' || feedBucket(i) === t).length}</span></button>)}</div><button onClick={data.refetch} className="btn btn-ghost btn-sm">Refresh</button></div>
    <div className="flex flex-col gap-2 sm:flex-row"><label className="input input-sm min-w-0 flex-1 rounded-full"><FiSearch aria-hidden /><input aria-label="Search assignments" placeholder="Find an assignment…" value={q} onChange={e => change('q', e.target.value)} /></label><select className="select select-sm rounded-full" aria-label="Filter by course" value={course} onChange={e => change('course', e.target.value)}><option value="">All courses</option>{[...new Set(items.map(i => i.course))].map(c => <option key={c}>{c}</option>)}</select><select className="select select-sm rounded-full" aria-label="Filter by task type" value={kind} onChange={e => change('kind', e.target.value)}><option value="">All task types</option><option value="homework">Homework</option><option value="quiz">Quizzes & activities</option></select></div>
    <section className="card overflow-hidden border border-base-300/70 bg-base-100"><div className="flex items-center justify-between border-b border-base-300/60 px-5 py-4"><h2 className="text-sm font-semibold">{tab === 'All' ? 'Your assignments' : tab}</h2><span className="text-xs text-base-content/50">{filtered.length} {filtered.length === 1 ? 'task' : 'tasks'}</span></div>{filtered.length ? filtered.map(i => <AssignmentRow key={i.id} item={i} />) : <div className="flex flex-col items-center gap-3 px-6 py-12 text-center"><FiBookOpen size={28} className="text-base-content/40" /><h3 className="font-semibold">{items.length ? 'Nothing here just yet' : 'Your next assignment will appear here'}</h3><p className="max-w-sm text-sm leading-6 text-base-content/60">{items.length ? 'Try a different filter, or check another tab.' : 'Your teacher will share instructions and a deadline when your class is ready.'}</p>{items.length ? <button className="btn btn-sm" onClick={() => setParams({})}>Clear filters</button> : null}</div>}</section>
    <div className="rounded-box border border-base-300/60 p-5 text-xs leading-6 text-base-content/60"><strong className="text-base-content">A simple rhythm: </strong>Read the instructions → prepare your work → submit → use feedback to improve. Homework drafts save automatically. Timed quizzes keep their original timer when you resume.</div>
  </div>;
}
