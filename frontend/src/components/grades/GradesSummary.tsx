import { FiAward, FiTrendingDown, FiTrendingUp, FiTarget } from "react-icons/fi";
import type { MyAssessment } from "../../lib/services";
import { courseAverage, pct } from "./utils";

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
  const best = graded.length ? Math.max(...graded.map((a) => pct(whatIfOn ? (whatIf[a.id] ?? a.bestScore) : a.bestScore, a.maxScore) ?? 0)) : null;
  const completion = assessments.length ? Math.round((graded.length / assessments.length) * 100) : 0;

  // rough course count
  const courseAvgs = (() => {
    const byLevel = new Map<string, MyAssessment[]>();
    for (const a of assessments) {
      const k = a.level?.code ?? a.levelId;
      const arr = byLevel.get(k) ?? [];
      arr.push(a);
      byLevel.set(k, arr);
    }
    return [...byLevel.values()].map((items) => courseAverage(items, whatIfOn ? whatIf : {}));
  })().filter((v): v is number => v !== null);
  const overallCourseAvg = courseAvgs.length ? Math.round(courseAvgs.reduce((s, v) => s + v, 0) / courseAvgs.length) : null;

  const cards = [
    { label: "Overall", value: avg !== null ? `${avg}%` : "—", sub: whatIfOn ? "What-if" : `${graded.length}/${assessments.length} graded`, icon: FiAward, tone: "bg-brand text-white" },
    { label: "Best score", value: best !== null ? `${best}%` : "—", sub: "Highest assignment", icon: FiTarget, tone: "bg-success text-white" },
    { label: "Completion", value: `${completion}%`, sub: "Assignments with a score", icon: FiTrendingUp, tone: "bg-info text-white" },
    { label: "Courses avg", value: overallCourseAvg !== null ? `${overallCourseAvg}%` : "—", sub: `${courseAvgs.length} courses`, icon: overallCourseAvg !== null && overallCourseAvg >= 70 ? FiTrendingUp : FiTrendingDown, tone: "bg-base-200" },
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
