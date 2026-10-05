import { FiArrowRight, FiBookOpen, FiCalendar, FiMapPin, FiUsers } from "react-icons/fi";
import { Link } from "react-router-dom";
import type { MyProfile } from "../../lib/services";

export function ProfileDetails({ profile }: { profile: MyProfile }) {
  const details = [
    { label: 'Campus', value: profile.campus?.name ?? 'Not assigned', icon: FiMapPin },
    { label: 'Intake', value: profile.intake?.name ?? 'Not assigned', icon: FiCalendar },
    { label: 'Current level', value: profile.currentLevel ? `${profile.currentLevel.code} · ${profile.currentLevel.title}` : 'Not assigned', icon: FiBookOpen },
    { label: 'Intended level', value: profile.intendedLevel?.code ?? 'Not selected', icon: FiUsers },
  ];
  return <section className="card border border-base-300/70 bg-base-100 p-5">
    <h2 className="text-base font-semibold">Student details</h2>
    <div className="mt-4 space-y-4">{details.map(d => <div key={d.label} className="flex items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-base-200"><d.icon aria-hidden className="text-base-content/50" /></span><div className="min-w-0"><p className="text-[10px] text-base-content/55">{d.label}</p><p className="mt-0.5 text-xs font-medium">{d.value}</p></div></div>)}</div>
    {profile.enrollments.length ? <div className="mt-5 border-t border-base-300/60 pt-4"><p className="mb-2 text-[10px] text-base-content/55">My classes</p><div className="flex flex-wrap gap-2">{profile.enrollments.map((e, i) => <span key={e.id ?? i} className="badge badge-sm badge-ghost h-auto py-2">{e.level.code}{e.classGroup ? ` · ${e.classGroup.name}` : ''}</span>)}</div></div> : null}
    <Link to="/grades" className="mt-5 flex items-center justify-between rounded-xl bg-base-200 p-3 text-xs font-semibold">Grades & feedback<FiArrowRight aria-hidden /></Link>
  </section>;
}
