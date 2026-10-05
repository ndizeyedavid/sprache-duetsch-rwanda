import { ProgressBar } from "../ui/ProgressBar";
import type { MyProgressLevel } from "../../lib/services";

type Props = { levels: MyProgressLevel[]; loading: boolean; error: string | null; onRetry: () => void };

export function ProgressSection({ levels, loading, error, onRetry }: Props) {
  if (loading) return <p className="py-6 text-center text-sm text-muted">Loading progress…</p>;
  if (error) return <div className="py-4 text-center"><p className="text-sm text-error">{error}</p><button type="button" onClick={onRetry} className="btn btn-xs mt-2 rounded-full border-line bg-base-100">Retry</button></div>;
  if (!levels.length) return <p className="py-6 text-center text-sm text-muted">No progress yet — start a lesson to track your progress.</p>;
  return (
    <div className="space-y-4">
      {levels.map(({ level, modules, completionPercentage }) => (
        <div key={level.id} className="rounded-2xl bg-base-200/50 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold">{level.code} · {level.title}</p>
            <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand">{completionPercentage}%</span>
          </div>
          <p className="text-xs text-muted">{level.levelLabel}</p>
          <div className="mt-2"><ProgressBar value={completionPercentage} tone="brand" /></div>
          <ul className="ml-2 mt-4 space-y-3 border-l-2 border-base-300 pl-4">
            {modules.map((m) => {
              const done = m.lessons.filter((l) => l.status === "COMPLETED").length;
              return <li key={m.id} className="relative flex items-center justify-between gap-3 text-xs"><span aria-hidden className={`absolute -left-[23px] size-3 rounded-full border-2 border-base-100 ${done === m.lessons.length && done > 0 ? "bg-primary" : "bg-base-300"}`} /><span className="font-medium">{m.title}</span><span className="text-muted">{done}/{m.lessons.length}</span></li>;
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
