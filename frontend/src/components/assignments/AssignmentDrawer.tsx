import { FiCalendar, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import type { AssignmentItem } from "../../lib/services";
import { STATUS_LABEL, STATUS_TONE } from "./constants";
import { humanType } from "./utils";

type Props = { open: boolean; onClose: () => void; item: AssignmentItem | null };

export function AssignmentDrawer({ open, onClose, item }: Props) {
  if (!open || !item) return null;
  const link =
    item.source === "ACTIVITY" && item.lessonId
      ? `/courses/${item.levelCode.toLowerCase()}/learn/${item.lessonId}/activity/${item.activityId}`
      : item.assessmentId
        ? `/courses/${item.levelCode.toLowerCase()}`
        : "/courses";
  return (
    <div className="fixed inset-0 z-40 flex">
      <button type="button" aria-label="Close" onClick={onClose} className="flex-1 bg-black/40 backdrop-blur-sm" />
      <div className="flex h-full w-full max-w-md flex-col overflow-hidden bg-base-100 shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-line p-4">
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight">{item.title}</p>
            <p className="mt-1 text-xs text-muted">{item.levelCode} · {humanType(item.type)} · {item.points} pts</p>
            <span className={`badge badge-sm mt-2 ${STATUS_TONE[item.status] ?? "badge-ghost"}`}>{STATUS_LABEL[item.status] ?? item.status}</span>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-xs btn-circle"><FiX aria-hidden /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {item.moduleTitle || item.lessonTitle ? <p className="text-xs text-muted">{[item.moduleTitle, item.lessonTitle].filter(Boolean).join(" · ")}</p> : null}
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted"><FiCalendar aria-hidden />{item.dueAt ? new Date(item.dueAt).toLocaleString("en-GB") : "No due date"}</p>
          {item.score !== null ? <p className="mt-2 text-sm"><span className="font-bold">{item.score}/{item.maxScore}</span> <span className="text-muted">score</span></p> : null}
          {item.submittedAt ? <p className="mt-1 text-xs text-muted">Submitted {new Date(item.submittedAt).toLocaleString("en-GB")}</p> : null}
          <div className="mt-4 flex gap-2">
            <Link to={link} className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90">{item.status === "GRADED" ? "View feedback" : item.status === "SUBMITTED" ? "View submission" : "Open assignment"}</Link>
            <button type="button" onClick={onClose} className="btn btn-sm rounded-full border-line bg-base-100">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
