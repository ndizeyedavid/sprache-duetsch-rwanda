import { humanize } from '../../lib/services';
import { ProgressBar } from '../ui/ProgressBar';

type Skill = { skill: string; earned: number; possible: number; percentage: number };

type Props = { skills: Skill[] };

export function SkillsPanel({ skills }: Props) {
  if (skills.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm font-medium">No graded work yet</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted">Skill scores appear once your exams are graded — keep completing lessons.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {skills.map((s) => (
        <div key={s.skill}>
          <div className="mb-1 flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold">{humanize(s.skill)}</span>
            <span className="text-muted">{s.earned}/{s.possible} · {s.percentage}%</span>
          </div>
          <ProgressBar value={s.percentage} tone={s.percentage >= 70 ? 'brand' : s.percentage >= 50 ? 'sun' : 'coral'} />
        </div>
      ))}
    </div>
  );
}
