import { FiArrowLeft, FiAward, FiEdit3 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { humanType } from './utils';
import type { AssignmentDetailData } from './types';

export function AssignmentDetailHeader({ data }: { data: AssignmentDetailData }) {
  const activity = data.source === 'ACTIVITY';
  const level = data.lesson?.module.level ?? data.level;
  return (
    <header className="space-y-4">
      <Link to="/assignments" className="inline-flex items-center gap-2 text-xs text-base-content/65 hover:text-base-content"><FiArrowLeft aria-hidden />Assignments</Link>
      <div className="journey-hero card flex-row items-center gap-4 border border-base-300/70 p-5 sm:p-6">
        <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-2xl border border-primary/10 bg-base-100/80 text-primary">{activity ? <FiEdit3 className="text-2xl" /> : <FiAward className="text-2xl" />}</span>
        <div className="min-w-0"><p className="text-[10px] font-medium uppercase tracking-widest text-base-content/60">{level?.code ? `${level.code} · ` : ''}{humanType((activity ? data.activity?.type : data.assessment?.type) ?? (activity ? 'Activity' : 'Assessment'))}</p><h2 className="mt-2 text-xl font-semibold leading-7 tracking-tight sm:text-2xl">{activity ? data.activity?.title : data.assessment?.title}</h2>{data.lesson ? <p className="mt-1 text-xs text-base-content/60">{data.lesson.title}</p> : null}</div>
      </div>
    </header>
  );
}
