import { FiEdit3, FiMail, FiPhone, FiUser } from "react-icons/fi";
import { Link } from "react-router-dom";
import { StatusBadge } from "../ui/StatusBadge";
import { humanize } from "../../lib/services";
import type { MyProfile } from "../../lib/services";

export function ProfileHeader({ profile }: { profile: MyProfile }) {
  const u = profile.user;
  return (
    <section className="card overflow-hidden border border-base-300/70 bg-base-100">
      <div className="journey-hero relative p-5 sm:p-7">
        <FiUser aria-hidden className="pointer-events-none absolute right-8 top-5 text-[130px] text-primary/5" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className={`avatar shrink-0 ${u.avatarUrl ? '' : 'avatar-placeholder'}`}>
            <div className="w-24 rounded-3xl border-4 border-base-100 bg-primary/10 text-primary">
              {u.avatarUrl ? <img src={u.avatarUrl} alt={`${u.firstName} ${u.lastName}`} /> : <span className="text-3xl font-semibold">{u.firstName.charAt(0)}{u.lastName.charAt(0)}</span>}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-base-content/50">My profile</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{u.firstName} {u.lastName}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2"><StatusBadge status={humanize(u.status)} /><span className="font-mono text-xs text-base-content/60">{profile.studentCode}</span>{profile.currentLevel ? <span className="badge badge-sm badge-outline">{profile.currentLevel.code} learner</span> : null}</div>
          </div>
          <Link to="/settings" className="btn btn-primary btn-sm self-start rounded-full sm:self-center"><FiEdit3 aria-hidden />Edit profile</Link>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-3 border-t border-base-300/60 px-5 py-4 text-xs sm:px-7">
        <span className="flex min-w-0 items-center gap-2"><FiMail aria-hidden className="shrink-0 text-base-content/45" /><span className="break-all">{u.email}</span></span>
        <span className="flex items-center gap-2"><FiPhone aria-hidden className="text-base-content/45" />{u.phone ?? 'Phone not added'}</span>
      </div>
    </section>
  );
}
