import { FiArrowDownRight, FiArrowUpRight, FiMinus } from "react-icons/fi";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MyAttempt } from "../../lib/services";
import { trendDirection } from "./utils";

type Props = { code: string; title: string; attempts: MyAttempt[] };

export function CourseTrendCard({ code, title, attempts }: Props) {
  const sorted = [...attempts].filter((a) => a.score !== null).sort((a, b) => new Date(a.submittedAt ?? a.startedAt).getTime() - new Date(b.submittedAt ?? b.startedAt).getTime());
  const data = sorted.map((a) => ({ date: new Date(a.submittedAt ?? a.startedAt).toLocaleDateString("en-GB", { month: "short", day: "numeric" }), pct: Math.round((a.score! / a.maxScore) * 100), title: a.assessment.title }));
  const dir = trendDirection(attempts);
  const last = data[data.length - 1]?.pct ?? null;
  if (!data.length) return <div className="rounded-box border border-line bg-base-100 p-4"><p className="text-sm font-bold">{code} · {title}</p><p className="mt-6 py-8 text-center text-xs text-muted">No graded attempts yet.</p></div>;
  return (
    <div className="rounded-box border border-line bg-base-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-sm font-bold">{code} · {title}</p><p className="text-xs text-muted">{attempts.length} attempts · {last !== null ? `${last}% last` : ""}</p></div>
        <span className={`badge badge-sm gap-1 ${dir === "up" ? "badge-success" : dir === "down" ? "badge-error" : "badge-ghost"}`}>{dir === "up" ? <FiArrowUpRight aria-hidden /> : dir === "down" ? <FiArrowDownRight aria-hidden /> : <FiMinus aria-hidden />}{dir}</span>
      </div>
      <div className="mt-3 h-28">
        <ResponsiveContainer width="100%" height="100%"><AreaChart data={data}><XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} tick={{ fontSize: 10 }} width={30} axisLine={false} tickLine={false} /><Tooltip formatter={(v) => [`${v}%`, "Score"]} labelFormatter={(l) => String(l)} /><Area type="monotone" dataKey="pct" stroke="#fb0d00" fill="#fb0d0018" strokeWidth={2} dot={false} /></AreaChart></ResponsiveContainer>
      </div>
    </div>
  );
}
