import { useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import type { MyAssessment } from "../../lib/services";
import { courseAverage, groupByLevel, letter, pct, toneFor } from "./utils";
import { TYPE_LABEL } from "./constants";

type Props = {
  assessments: MyAssessment[];
  whatIf: Record<string, number>;
  onWhatIfChange: (id: string, value: number | null) => void;
  whatIfOn: boolean;
};

function StatusPill({ a }: { a: MyAssessment }) {
  if (a.attemptCount === 0) return <span className="badge badge-sm badge-ghost">Not started</span>;
  if (a.latestStatus === "GRADED" || a.bestScore !== null) return <span className="badge badge-sm badge-success">Graded</span>;
  return <span className="badge badge-sm badge-warning">Pending</span>;
}

export function GradesTable({ assessments, whatIf, onWhatIfChange, whatIfOn }: Props) {
  const groups = groupByLevel(assessments);
  const [open, setOpen] = useState<Record<string, boolean>>(() => Object.fromEntries(groups.map((g) => [g.level.code, true])));
  if (!groups.length) return <p className="py-8 text-center text-sm text-muted">No assignments match your filters.</p>;
  return (
    <div className="space-y-4">
      {groups.map(({ level, items }) => {
        const avg = courseAverage(items, whatIfOn ? whatIf : {});
        const isOpen = open[level.code] ?? true;
        return (
          <div key={level.code} className="overflow-hidden rounded-box border border-line bg-base-100">
            <button type="button" onClick={() => setOpen((p) => ({ ...p, [level.code]: !isOpen }))} className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-base-200/50">
              <span className="flex items-center gap-2 text-sm font-bold">{isOpen ? <FiChevronDown aria-hidden /> : <FiChevronRight aria-hidden />}{level.code} · {level.title}<span className="badge badge-sm">{items.length}</span></span>
              <span className={`text-sm font-bold ${toneFor(avg)}`}>{avg !== null ? `${avg}% · ${letter(avg)}` : "—"}</span>
            </button>
            {isOpen ? (
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead><tr className="text-xs text-muted"><th>Assignment</th><th className="hidden sm:table-cell">Due</th><th>Status</th><th className="text-right">Score</th><th className="text-right hidden sm:table-cell">Out of</th><th className="text-right">%</th><th className="text-center hidden sm:table-cell">Grade</th></tr></thead>
                  <tbody>
                    {items.map((a) => {
                      const score = whatIfOn ? (whatIf[a.id] ?? a.bestScore) : a.bestScore;
                      const p = pct(score ?? null, a.maxScore);
                      return (
                        <tr key={a.id} className="hover">
                          <td><p className="text-sm font-medium">{a.title}</p><p className="text-xs text-muted">{TYPE_LABEL[a.type] ?? a.type} · {a.attemptCount} attempt{a.attemptCount !== 1 ? "s" : ""}</p></td>
                          <td className="hidden sm:table-cell text-xs text-muted">{a.availableUntil ? new Date(a.availableUntil).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}</td>
                          <td><StatusPill a={a} /></td>
                          <td className="text-right">
                            {whatIfOn ? <input type="number" min={0} max={a.maxScore} value={whatIf[a.id] ?? a.bestScore ?? ""} onChange={(e) => { const v = e.target.value === "" ? null : Number(e.target.value); onWhatIfChange(a.id, v === null || Number.isNaN(v) ? null : Math.min(Math.max(v, 0), a.maxScore)); }} className="input input-sm w-20 text-right" placeholder="—" /> : <span className="text-sm font-semibold">{score ?? "—"}</span>}
                          </td>
                          <td className="hidden sm:table-cell text-right text-xs">{a.maxScore}</td>
                          <td className={`text-right text-sm font-bold ${toneFor(p)}`}>{p !== null ? `${p}%` : "—"}</td>
                          <td className="hidden sm:table-cell text-center text-xs font-bold">{letter(p)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <p className="border-t border-line bg-base-200/40 px-4 py-2 text-right text-xs">Course total: <span className={`font-bold ${toneFor(avg)}`}>{avg !== null ? `${avg}%` : "—"}</span></p>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
