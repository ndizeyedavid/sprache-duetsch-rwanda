import { FiCalendar, FiFileText, FiAward } from "react-icons/fi";
import { Link } from "react-router-dom";
import type { AssignmentItem } from "../../lib/services";
import { STATUS_LABEL, STATUS_TONE } from "./constants";
import { humanType } from "./utils";

type Props = { item: AssignmentItem };

export function AssignmentCard({ item }: Props) {
  const due = item.dueAt ? new Date(item.dueAt) : null;
  const overdue = due ? due < new Date() && item.status !== "GRADED" && item.status !== "SUBMITTED" : false;
  return (
    <Link to={`/assignments/${encodeURIComponent(item.id)}`} className="flex w-full gap-3 rounded-box border border-line bg-base-100 p-4 text-left hover:border-brand/20">
      <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${item.source === "ASSESSMENT" ? "bg-brand text-white" : "bg-info text-white"}`}>
        {item.source === "ASSESSMENT" ? <FiAward aria-hidden /> : <FiFileText aria-hidden />}
      </span>
      <span className="min-w-0 grow">
        <span className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold">{item.title}</span>
          <span className={`badge badge-sm ${STATUS_TONE[item.status] ?? "badge-ghost"}`}>{STATUS_LABEL[item.status] ?? item.status}</span>
        </span>
        <span className="block truncate text-xs text-muted">{item.levelCode} · {item.lessonTitle ?? humanType(item.type)} · {item.points} pts</span>
        <span className={`mt-1 inline-flex items-center gap-1 text-xs ${overdue ? "text-error font-medium" : "text-muted"}`}>
          <FiCalendar aria-hidden size={12} />
          {due ? due.toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "No due date"}
          {item.score !== null ? ` · ${item.score}/${item.maxScore}` : ""}
        </span>
      </span>
    </Link>
  );
}
