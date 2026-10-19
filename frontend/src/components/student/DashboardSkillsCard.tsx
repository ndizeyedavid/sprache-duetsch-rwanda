import { FiArrowUpRight,FiBookOpen,FiEdit3,FiHeadphones,FiMic,FiTarget } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { SkillStat } from '../../lib/services';
import { humanize } from '../../lib/services';

const ICONS = { LISTENING: FiHeadphones, SPEAKING: FiMic, READING: FiBookOpen, WRITING: FiEdit3 };

export function DashboardSkillsCard({ skills }: { skills: SkillStat[] }) {
  const rows = skills.length ? skills : Object.keys(ICONS).map((skill) => ({ skill, percentage: null }));
  // The weakest graded skill is the most useful next step.
  const focus = [...skills].filter((row) => row.percentage !== null).sort((a, b) => (a.percentage ?? 0) - (b.percentage ?? 0))[0];
  return (
    <section className="card learning-panel h-full gap-4 p-5 sm:p-6">
      <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Language skills</h2><Link to="/grades" aria-label="View grades" className="btn btn-ghost btn-xs btn-circle"><FiArrowUpRight aria-hidden /></Link></div>
      <div className="space-y-4">
        {rows.map((row) => {
          const Icon = ICONS[row.skill as keyof typeof ICONS] ?? FiBookOpen;
          return <div key={row.skill} className="flex items-center gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-xl bg-info text-info-content"><Icon aria-hidden /></span>
            <div className="min-w-0 flex-1"><div className="mb-1.5 flex justify-between gap-2 text-[0.6875rem]"><span>{humanize(row.skill)}</span><span className="font-medium">{row.percentage === null ? '—' : `${row.percentage}%`}</span></div><progress className="progress progress-primary h-1 w-full" value={row.percentage ?? 0} max={100} aria-label={`${humanize(row.skill)} ${row.percentage === null ? 'not graded yet' : 'score'}`} /></div>
          </div>;
        })}
      </div>
      {focus ? (
        <Link to="/courses" className="mt-auto flex items-center gap-3 rounded-box bg-brand-tint p-3 hover:bg-brand-soft">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-content"><FiTarget aria-hidden /></span>
          <span className="min-w-0 flex-1 text-xs"><span className="block font-semibold">Focus next: {humanize(focus.skill)} · {focus.percentage}%</span>
            <span className="block text-muted">Your lowest skill — practise it in your next lesson.</span></span>
          <FiArrowUpRight aria-hidden className="shrink-0" />
        </Link>
      ) : <p className="mt-auto rounded-box bg-base-200 p-3 text-[0.6875rem] text-muted">Scores appear after your first graded quiz or test — then we show which skill to practise next.</p>}
    </section>
  );
}
