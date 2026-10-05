import type { MyAssessment } from '../../lib/services';
import { GradeResultCard } from './GradeResultCard';
import { groupByLevel } from './utils';

type Props = { assessments: MyAssessment[]; whatIf: Record<string, number>; onWhatIfChange: (id: string, value: number | null) => void; whatIfOn: boolean };
export function GradesTable({ assessments, whatIf, onWhatIfChange, whatIfOn }: Props) {
  const groups = groupByLevel(assessments);
  if (!groups.length) return <div className="card border border-base-300 bg-base-100 p-8 text-center"><p className="text-sm font-semibold">No matching results</p><p className="mt-1 text-xs text-base-content/55">Try a different search or clear the filters.</p></div>;
  return <div className="space-y-5">{groups.map(({ level, items }) => <section key={level.code}><div className="mb-3 flex items-center gap-2"><h2 className="text-sm font-semibold">{level.code} · {level.title}</h2><span className="badge badge-sm badge-ghost">{items.length}</span></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{items.map(a => <GradeResultCard key={a.id} assessment={a} whatIfOn={whatIfOn} projected={whatIf[a.id]} onProjection={v => onWhatIfChange(a.id, v)} />)}</div></section>)}</div>;
}
