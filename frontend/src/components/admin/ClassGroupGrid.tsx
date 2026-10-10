import { FiArrowUpRight,FiEdit2,FiMapPin,FiUsers } from "react-icons/fi";
import { Link } from "react-router-dom";
import type { ClassGroupItem } from "../../lib/services";
import { humanize } from "../../lib/services";
import { StatusBadge } from "../ui/StatusBadge";

export function ClassGroupGrid({
  rows,
  teacherNames,
  onEdit,
}: {
  rows: ClassGroupItem[];
  teacherNames: Record<string, string>;
  onEdit: (row: ClassGroupItem) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((group) => (
        <article
          key={group.id}
          className="card overflow-hidden border border-base-300/70 bg-base-100"
        >
          <div className="flex items-center justify-between border-b border-base-300/50 bg-base-200/60 px-4 py-3">
            <span className="badge badge-ghost text-xs font-semibold">
              {group.level.code}
            </span>
            <StatusBadge status={group.isActive ? "Active" : "Inactive"} />
          </div>
          <div className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-base-content/50">
              {group.code}
            </p>
            <h3 className="mt-1 text-base font-semibold">{group.name}</h3>
            <p className="mt-2 text-xs leading-5 text-base-content/65">
              {group.intake.name} · {humanize(group.shift)}
            </p>
            <p className="mt-3 flex items-center gap-2 text-xs text-base-content/60">
              <FiMapPin aria-hidden />
              {group.campus.name}
            </p>
            <div className="mt-4 flex items-center justify-between gap-2 border-t border-base-300/60 pt-3 text-xs">
              <span className="flex items-center gap-1.5">
                <FiUsers aria-hidden />
                {group._count.enrollments} enrolments
              </span>
              <span
                className={
                  group.teacherId ? "text-base-content/65" : "text-error"
                }
              >
                {group.teacherId
                  ? (teacherNames[group.teacherId] ?? "Teacher assigned")
                  : "Teacher needed"}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2"><button onClick={() => onEdit(group)} className="btn btn-sm rounded-full" aria-label={`Edit ${group.name}`}><FiEdit2 aria-hidden />Edit</button>
            <Link
              to="/admin/teaching"
              className="inline-flex items-center gap-2 text-xs font-semibold"
            >
              Teaching
              <FiArrowUpRight aria-hidden />
            </Link></div>
          </div>
        </article>
      ))}
    </div>
  );
}
