import { FiAward, FiBookOpen, FiClock, FiTrendingUp } from "react-icons/fi";
import type { MyProfile } from "../../lib/services";

type Props = { profile: MyProfile; overall: number | null };

export function ProfileStats({ profile, overall }: Props) {
  const attendance = profile.attendance.percentage;
  const cards = [
    { label: "Overall progress", value: overall !== null ? `${overall}%` : "—", sub: `${profile.lessonsCompleted} lessons done`, icon: FiTrendingUp, tone: "bg-brand text-white" },
    { label: "Attendance", value: `${attendance}%`, sub: `${profile.attendance.present}/${profile.attendance.total} present`, icon: FiClock, tone: "bg-info text-white" },
    { label: "Certificates", value: String(profile.certificates), sub: profile.currentLevel ? profile.currentLevel.code : "No level", icon: FiAward, tone: "bg-success text-white" },
    { label: "Enrolments", value: String(profile.enrollments.length), sub: profile.campus?.name ?? "—", icon: FiBookOpen, tone: "bg-base-200" },
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
          <p className="truncate text-xs text-muted">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}
