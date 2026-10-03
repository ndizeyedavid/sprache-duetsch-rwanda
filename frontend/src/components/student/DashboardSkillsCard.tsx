import { FiArrowUpRight, FiBookOpen, FiEdit3, FiHeadphones, FiMic } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { SkillStat } from '../../lib/services';
import { humanize } from '../../lib/services';

const ICONS = { LISTENING: FiHeadphones, SPEAKING: FiMic, READING: FiBookOpen, WRITING: FiEdit3 };

export function DashboardSkillsCard({ skills }: { skills: SkillStat[] }) {
  const rows = skills.length ? skills : Object.keys(ICONS).map((skill) => ({ skill, percentage: null }));
  return (
    <section className="card learning-panel h-full gap-4 p-5 sm:p-6">
      <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Language skills</h2><Link to="/grades" aria-label="View grades" className="btn btn-ghost btn-xs btn-circle"><FiArrowUpRight aria-hidden /></Link></div>
      <div className="space-y-4">
        {rows.map((row) => {
          const Icon = ICONS[row.skill as keyof typeof ICONS] ?? FiBookOpen;
          return <div key={row.skill} className="flex items-center gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-xl bg-info/10"><Icon aria-hidden /></span>
            <div className="min-w-0 flex-1"><div className="mb-1.5 flex justify-between gap-2 text-[11px]"><span>{humanize(row.skill)}</span><span className="font-medium">{row.percentage === null ? '—' : `${row.percentage}%`}</span></div><progress className="progress progress-primary h-1 w-full" value={row.percentage ?? 0} max={100} aria-label={`${humanize(row.skill)} ${row.percentage === null ? 'not graded yet' : 'score'}`} /></div>
          </div>;
        })}
      </div>
      {!skills.length ? <p className="text-[10px] text-base-content/60">Scores appear after your first graded assessment.</p> : null}
    </section>
  );
}
