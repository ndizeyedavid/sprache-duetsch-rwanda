import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { listMyHomework } from '../../lib/homework';
import { dateLabel,statusLabels } from '../assignments/homework/format';
export function HomeworkGrades() {
  const data = useApi('homework-grades', listMyHomework);
  const reviewed = (data.data ?? []).filter(a => a.submissions?.some(s => ['GRADED', 'RETURNED', 'SUBMITTED'].includes(s.status)));
  if (data.loading) return <p role="status" className="text-xs text-base-content/50">Loading homework feedback…</p>;
  if (data.error) return <div className="rounded-box border border-base-300 p-4 text-xs"><p role="alert">{data.error}</p><button className="btn btn-ghost btn-xs mt-2" onClick={data.refetch}>Retry homework grades</button></div>;
  if (!reviewed.length) return null;
  return <section className="card overflow-hidden border border-base-300/70 bg-base-100"><div className="border-b border-base-300/60 p-5"><h2 className="text-sm font-semibold">Homework & teacher feedback</h2><p className="mt-1 text-xs text-base-content/55">Your class tasks, shown separately from exam results.</p></div>{reviewed.map(a => { const s = a.submissions![0]; return <Link key={a.id} to={`/assignments/HW-${a.id}`} className="flex flex-wrap items-center justify-between gap-4 border-b border-base-300/60 p-5 hover:bg-base-200/40 last:border-0"><div><p className="text-xs font-semibold">{a.title}</p><p className="mt-1 text-[10px] text-base-content/55">{a.classGroup.level.code} · {statusLabels[s.status]} · {dateLabel(s.submittedAt)}</p></div><span className="text-sm font-semibold">{s.score !== null ? `${s.score}/${a.maxPoints}` : s.status === 'RETURNED' ? 'Read feedback →' : 'Awaiting review'}</span></Link>; })}</section>;
}
