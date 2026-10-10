import { FiAward,FiCheckCircle,FiClock,FiEdit3 } from "react-icons/fi";
import type { MyAssessment } from "../../lib/services";

type Props = { assessments: MyAssessment[]; whatIf: Record<string, number>; whatIfOn: boolean };

export function GradesSummary({ assessments, whatIf, whatIfOn }: Props) {
  const graded = assessments.filter((a) => (whatIfOn ? whatIf[a.id] ?? a.bestScore : a.bestScore) !== null);
  const avg = (() => {
    let e = 0;
    let p = 0;
    for (const a of graded) {
      const s = whatIfOn ? (whatIf[a.id] ?? a.bestScore!) : a.bestScore!;
      e += s;
      p += a.maxScore;
    }
    return p ? Math.round((e / p) * 100) : null;
  })();
  const cards = [
    { label: whatIfOn ? "Projected average" : "Average score", value: avg !== null ? `${avg}%` : "—", sub: "Based on scored work", icon: FiAward, tone: "bg-neutral text-neutral-content" },
    { label: "Graded", value: String(assessments.filter(a => a.bestScore !== null).length), sub: "Results ready to review", icon: FiCheckCircle, tone: "bg-success text-success-content" },
    { label: "Awaiting grading", value: String(assessments.filter(a => a.latestStatus === 'SUBMITTED' && a.bestScore === null).length), sub: "Submitted to your teacher", icon: FiClock, tone: "bg-neutral text-neutral-content" },
    { label: "Not started", value: String(assessments.filter(a => a.attemptCount === 0).length), sub: "Your next opportunities", icon: FiEdit3, tone: "bg-primary text-primary-content" },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-box border border-line bg-base-100 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted">{c.label}</p>
            <span className={`flex size-7 items-center justify-center rounded-full text-xs ${c.tone}`}><c.icon aria-hidden size={14} /></span>
          </div>
          <p className="mt-2 text-2xl font-bold">{c.value}</p>
          <p className="text-xs text-muted">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}
