import { FiArrowUpRight,FiClock } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { isoDate,isoTime,listSessions } from "../../lib/services";
import { sessionStatusLabel,teacherName } from "../../lib/sessions-ui";
import { EmptyBlock,ErrorBlock,LoadingBlock } from "../common/PageState";
import { Panel,SectionHeader } from "../ui/Panel";

export function AcademicSessions() {
  const sessions = useApi("academic-upcoming-sessions", listSessions);
  const upcoming = (sessions.data ?? [])
    .filter(
      (s) =>
        s.status === "LIVE" ||
        (["SCHEDULED", "RESCHEDULED"].includes(s.status) &&
          new Date(s.endAt).getTime() >= Date.now()),
    )
    .sort(
      (a, b) =>
        Number(b.status === "LIVE") - Number(a.status === "LIVE") ||
        new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    )
    .slice(0, 4);
  return (
    <Panel>
      <SectionHeader
        title="Upcoming sessions"
        action={{ label: "View all", to: "/admin/schedule" }}
      />
      {sessions.loading ? (
        <LoadingBlock label="Loading sessions…" />
      ) : sessions.error ? (
        <ErrorBlock message={sessions.error} onRetry={sessions.refetch} />
      ) : !upcoming.length ? (
        <EmptyBlock
          title="Room to plan your next class"
          hint="Add a session in Schedule so learners know when and where to join."
        />
      ) : (
        <div className="space-y-3">
          {upcoming.map((s) => (
            <Link
              key={s.id}
              to={`/admin/live-class?session=${s.id}`}
              className="group flex gap-3 rounded-box border border-base-300/60 p-3 transition hover:bg-base-200/50"
            >
              <span className="flex w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-base-200 text-xs">
                <strong className="text-lg">
                  {new Date(s.startAt).getDate()}
                </strong>
                {new Date(s.startAt).toLocaleDateString(undefined, {
                  month: "short",
                })}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold">{s.title}</p>
                <p className="mt-1 text-[11px] text-base-content/60">
                  {s.classGroup?.name ?? "All learners"} ·{" "}
                  {teacherName(s.teacher)}
                </p>
                <p className="mt-2 flex items-center gap-1 text-[11px] text-base-content/60">
                  <FiClock aria-hidden />
                  {isoDate(s.startAt)} · {isoTime(s.startAt)}
                  <span className="badge badge-ghost badge-xs ml-auto">
                    {sessionStatusLabel(s.status)}
                  </span>
                </p>
              </div>
              <FiArrowUpRight aria-hidden className="shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </Panel>
  );
}
