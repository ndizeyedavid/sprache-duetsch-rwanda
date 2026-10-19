import { FiAward,FiBookOpen,FiCalendar,FiCheckCircle,FiClipboard } from "react-icons/fi";
import { Link } from "react-router-dom";
import type { AssignmentItem } from "../../lib/services";
import { Drawer } from "../ui/overlay/Drawer";
import { useLastValue } from "../ui/overlay/useLastValue";
import { STATUS_LABEL } from "./constants";
import { humanType } from "./utils";

type Props = { open: boolean; onClose: () => void; item: AssignmentItem | null };

const linkFor = (item: AssignmentItem) =>
  item.source === "ACTIVITY" && item.lessonId
    ? `/courses/${item.levelCode.toLowerCase()}/learn/${item.lessonId}/activity/${item.activityId}`
    : item.assessmentId ? `/courses/${item.levelCode.toLowerCase()}` : "/courses";

/** One assignment at a glance — where it lives, when it is due, the score — and a way into it. */
export function AssignmentDrawer({ open, onClose, item: current }: Props) {
  const item = useLastValue(current);
  if (!item) return null;
  const fact = "flex items-center gap-2 rounded-box bg-base-200 px-3 py-2.5 text-sm";
  return (
    <Drawer open={open && Boolean(current)} onClose={onClose} icon={FiClipboard} title={item.title}
      subtitle={`${item.levelCode} · ${humanType(item.type)} · ${item.points} pts`}
      meta={<span className="hero-chip hero-chip-solid px-2.5 py-0.5 text-[0.6875rem]">{STATUS_LABEL[item.status] ?? item.status}</span>}
      footer={<Link to={linkFor(item)} className="btn btn-primary btn-sm w-full rounded-full">
        {item.status === "GRADED" ? "View feedback" : item.status === "SUBMITTED" ? "View submission" : "Open assignment"}</Link>}>
      <div className="space-y-2">
        {item.moduleTitle || item.lessonTitle ? <p className={fact}><FiBookOpen aria-hidden className="shrink-0 text-primary" />{[item.moduleTitle, item.lessonTitle].filter(Boolean).join(" · ")}</p> : null}
        <p className={fact}><FiCalendar aria-hidden className="shrink-0 text-primary" />{item.dueAt ? `Due ${new Date(item.dueAt).toLocaleString("en-GB")}` : "No due date"}</p>
        {item.score !== null ? <p className={fact}><FiAward aria-hidden className="shrink-0 text-primary" /><strong>{item.score}/{item.maxScore}</strong> score</p> : null}
        {item.submittedAt ? <p className={fact}><FiCheckCircle aria-hidden className="shrink-0 text-primary" />Submitted {new Date(item.submittedAt).toLocaleString("en-GB")}</p> : null}
      </div>
    </Drawer>
  );
}
