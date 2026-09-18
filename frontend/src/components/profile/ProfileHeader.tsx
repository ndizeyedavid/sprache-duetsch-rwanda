import { StatusBadge } from "../ui/StatusBadge";
import { humanize } from "../../lib/services";
import type { MyProfile } from "../../lib/services";

type Props = { profile: MyProfile };

export function ProfileHeader({ profile }: Props) {
  const u = profile.user;
  return (
    <div className="flex gap-4">
      {u.avatarUrl ? <img src={u.avatarUrl} alt={`${u.firstName} ${u.lastName}`} className="size-16 shrink-0 rounded-full object-cover" /> : <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-brand-tint text-xl font-bold text-brand">{u.firstName.charAt(0)}{u.lastName.charAt(0)}</span>}
      <div className="min-w-0">
        <h1 className="text-xl font-bold leading-tight">{u.firstName} {u.lastName}</h1>
        <p className="truncate text-sm text-muted">{u.email}{u.phone ? ` · ${u.phone}` : ""}</p>
        <p className="font-mono text-xs text-muted">ID · {profile.studentCode}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <StatusBadge status={humanize(u.status)} />
          {profile.finance ? <StatusBadge status={humanize(profile.finance.status)} /> : null}
          {profile.currentLevel ? <span className="badge badge-sm">{profile.currentLevel.code}</span> : null}
        </div>
      </div>
    </div>
  );
}
