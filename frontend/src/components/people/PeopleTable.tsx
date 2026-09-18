import { FiMail, FiMessageCircle } from "react-icons/fi";
import { StatusBadge } from "../ui/StatusBadge";
import { humanize } from "../../lib/services";
import { initials } from "./utils";

type Person = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  roleLabel: string;
  groups: { id: string; name: string }[];
  status?: string;
  extra?: string;
};

type Props = {
  rows: Person[];
  onMessage: (userId: string) => void;
  sendingId: string | null;
};

export function PeopleTable({ rows, onMessage, sendingId }: Props) {
  if (rows.length === 0) return <p className="py-8 text-center text-sm text-muted">No results.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="table table-sm">
        <thead>
          <tr className="text-xs text-muted">
            <th>Person</th>
            <th>Role</th>
            <th>Group</th>
            <th>Status</th>
            <th className="text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.userId} className="hover">
              <td>
                <div className="flex items-center gap-3">
                  {p.avatarUrl ? <img src={p.avatarUrl} alt="" className="size-9 rounded-full object-cover" /> : <span className="flex size-9 items-center justify-center rounded-full bg-brand-tint text-xs font-bold text-brand">{initials(p.firstName, p.lastName)}</span>}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{p.firstName} {p.lastName}</p>
                    <p className="flex items-center gap-1 truncate text-xs text-muted"><FiMail aria-hidden size={11} />{p.email}</p>
                    {p.extra ? <p className="text-[11px] text-muted">{p.extra}</p> : null}
                  </div>
                </div>
              </td>
              <td><span className="badge badge-sm badge-ghost">{p.roleLabel}</span></td>
              <td className="text-xs">{p.groups.length ? p.groups.map((g) => g.name).join(", ") : "—"}</td>
              <td>{p.status ? <StatusBadge status={humanize(p.status)} /> : <span className="text-xs text-muted">—</span>}</td>
              <td className="text-right">
                <button type="button" onClick={() => onMessage(p.userId)} disabled={sendingId === p.userId} className="btn btn-xs btn-ghost gap-1 text-brand">
                  <FiMessageCircle aria-hidden />{sendingId === p.userId ? "…" : "Message"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
