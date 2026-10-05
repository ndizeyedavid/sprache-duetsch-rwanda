import type { CSSProperties } from "react";
import { FiAward, FiBookOpen, FiCheckCircle } from "react-icons/fi";
import type { MyProfile } from "../../lib/services";

export function ProfileStats({ profile, overall }: { profile: MyProfile; overall: number | null }) {
  const cards = [
    { label: "Lessons completed", value: profile.lessonsCompleted, icon: FiBookOpen },
    { label: "Attendance", value: profile.attendance.total ? `${profile.attendance.percentage}%` : '—', icon: FiCheckCircle },
    { label: "Certificates earned", value: profile.certificates, icon: FiAward },
  ];
  const percent = Math.min(100, Math.max(0, overall ?? 0));
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <div className="card flex-row items-center gap-3 border border-base-300/70 bg-base-100 p-4">
        <div className="radial-progress shrink-0 text-primary" style={{ '--value': percent, '--size': '3rem', '--thickness': '4px' } as CSSProperties} role="progressbar" aria-label="Learning progress" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span className="text-[10px] font-semibold">{overall === null ? '—' : `${percent}%`}</span></div>
        <p className="text-xs text-base-content/60">Learning<br />progress</p>
      </div>
      {cards.map(c => <div key={c.label} className="card flex-row items-center gap-3 border border-base-300/70 bg-base-100 p-4"><span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-base-200 text-base-content/65"><c.icon aria-hidden size={18} /></span><div><p className="text-xl font-semibold">{c.value}</p><p className="text-[10px] text-base-content/60">{c.label}</p></div></div>)}
    </div>
  );
}
