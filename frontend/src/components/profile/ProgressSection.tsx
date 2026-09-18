import { ProgressBar } from "../ui/ProgressBar";
import type { MyProgressLevel } from "../../lib/services";

type Props = { levels: MyProgressLevel[]; loading: boolean; error: string | null; onRetry: () => void };

export function ProgressSection({ levels, loading, error, onRetry }: Props) {
  if (loading) return <p className="py-6 text-center text-sm text-muted">Loading progress…</p>;
  if (error) return <div className="py-4 text-center"><p className="text-sm text-error">{error}</p><button type="button" onClick={onRetry} className="btn btn-xs mt-2 rounded-full border-line bg-base-100">Retry</button></div>;
  if (!levels.length) return <p className="py-6 text-center text-sm text-muted">No progress yet — start a lesson to track your progress.</p>;
  return (
    <div className="space-y-5">
      {levels.map(({ level, modules, completionPercentage }) => (
        <div key={level.id} className="rounded-box border border-line bg-base-100 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold">{level.code} · {level.title}</p>
            <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand">{completionPercentage}%</span>
          </div>
          <p className="text-xs text-muted">{level.levelLabel}</p>
          <div className="mt-2"><ProgressBar value={completionPercentage} tone="brand" /></div>
          <ul className="mt-3 space-y-1.5">
            {modules.map((m) => {
              const done = m.lessons.filter((l) => l.status === "COMPLETED").length;
              return <li key={m.id} className="flex items-center justify-between rounded-box bg-base-200/40 px-3 py-2 text-xs"><span className="font-medium">{m.title}</span><span className="text-muted">{done}/{m.lessons.length}</span></li>;
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
