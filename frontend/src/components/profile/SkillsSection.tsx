import { ProgressBar } from "../ui/ProgressBar";
import { humanize } from "../../lib/services";
import type { SkillStat } from "../../lib/services";

type Props = { skills: SkillStat[] | null; loading: boolean; error: string | null; onRetry: () => void };

export function SkillsSection({ skills, loading, error, onRetry }: Props) {
  if (loading) return <p className="py-6 text-center text-sm text-muted">Loading skills…</p>;
  if (error) return <div className="py-4 text-center"><p className="text-sm text-error">{error}</p><button type="button" onClick={onRetry} className="btn btn-xs mt-2 rounded-full border-line bg-base-100">Retry</button></div>;
  if (!skills || skills.length === 0) return <p className="py-6 text-center text-sm text-muted">No graded work yet — skill scores appear once exams are graded.</p>;
  return (
    <div className="space-y-3">
      {skills.map((s) => (
        <div key={s.skill}>
          <div className="mb-1 flex items-center justify-between text-xs"><span className="font-semibold">{humanize(s.skill)}</span><span className="text-muted">{s.earned}/{s.possible} · {s.percentage}%</span></div>
          <ProgressBar value={s.percentage} tone="sun" />
        </div>
      ))}
    </div>
  );
}
