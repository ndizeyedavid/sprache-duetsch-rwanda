import { useMemo } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MyAssessment, MyAttempt, SkillStat } from "../../lib/services";
import { CourseTrendCard } from "./CourseTrendCard";

type Props = { assessments: MyAssessment[]; attempts: MyAttempt[]; skills: SkillStat[] | null };

export function ProgressionPanel({ assessments, attempts, skills }: Props) {
  const timeline = useMemo(() => {
    const sorted = [...attempts].filter((a) => a.score !== null).sort((a, b) => new Date(a.submittedAt ?? a.startedAt).getTime() - new Date(b.submittedAt ?? b.startedAt).getTime());
    return sorted.map((a) => ({ date: new Date(a.submittedAt ?? a.startedAt).toLocaleDateString("en-GB", { month: "short", day: "numeric" }), pct: Math.round((a.score! / a.maxScore) * 100), title: a.assessment.title }));
  }, [attempts]);

  const byCourse = useMemo(() => {
    const map = new Map<string, { title: string; attempts: MyAttempt[] }>();
    for (const a of assessments) {
      const key = a.level?.code ?? a.levelId;
      if (!map.has(key)) map.set(key, { title: a.level?.title ?? key, attempts: [] });
    }
    for (const at of attempts) {
      const assessment = assessments.find((a) => a.id === at.assessment.id);
      const key = assessment?.level?.code ?? assessment?.levelId ?? "Other";
      const title = assessment?.level?.title ?? key;
      const entry = map.get(key) ?? { title, attempts: [] };
      entry.attempts.push(at);
      map.set(key, entry);
    }
    return [...map.entries()].map(([code, v]) => ({ code, ...v }));
  }, [assessments, attempts]);

  const distribution = useMemo(() => {
    const buckets = [{ label: "0-59", min: 0, max: 59, count: 0 }, { label: "60-69", min: 60, max: 69, count: 0 }, { label: "70-79", min: 70, max: 79, count: 0 }, { label: "80-89", min: 80, max: 89, count: 0 }, { label: "90-100", min: 90, max: 100, count: 0 }];
    for (const a of attempts) if (a.score !== null) { const p = Math.round((a.score / a.maxScore) * 100); const b = buckets.find((x) => p >= x.min && p <= x.max); if (b) b.count += 1; }
    return buckets;
  }, [attempts]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-box border border-line bg-base-100 p-4 lg:col-span-2">
          <h3 className="text-sm font-bold">Overall progression</h3>
          <p className="text-xs text-muted">Score trend across all courses (chronological)</p>
          <div className="mt-3 h-56">
            {timeline.length ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={timeline}><CartesianGrid strokeDasharray="3 3" opacity={0.2} /><XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 11 }} width={32} /><Tooltip formatter={(v) => [`${v}%`, "Score"]} /><Area type="monotone" dataKey="pct" stroke="#fb0d00" fill="#fb0d0018" strokeWidth={2.5} /></AreaChart></ResponsiveContainer> : <p className="py-16 text-center text-sm text-muted">No progression data yet — complete an assignment to see your trend.</p>}
          </div>
        </div>
        <div className="rounded-box border border-line bg-base-100 p-4">
          <h3 className="text-sm font-bold">Grade distribution</h3>
          <p className="text-xs text-muted">How your scores cluster</p>
          <div className="mt-3 h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={distribution}><XAxis dataKey="label" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} /><Tooltip /><Bar dataKey="count" fill="#025" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </div>
      </div>

      {skills && skills.length ? (
        <div className="rounded-box border border-line bg-base-100 p-4">
          <h3 className="text-sm font-bold">Skills</h3>
          <div className="mt-3 h-40"><ResponsiveContainer width="100%" height="100%"><BarChart data={skills} layout="vertical"><XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} /><YAxis type="category" dataKey="skill" tick={{ fontSize: 11 }} width={90} /><Tooltip formatter={(v) => [`${v}%`, "Mastery"]} /><Bar dataKey="percentage" fill="#f3b800" radius={[0, 8, 8, 0]} /></BarChart></ResponsiveContainer></div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {byCourse.map((c) => <CourseTrendCard key={c.code} code={c.code} title={c.title} attempts={c.attempts.filter((a) => a.score !== null)} />)}
      </div>
    </div>
  );
}
