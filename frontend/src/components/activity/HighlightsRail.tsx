import { Link } from "react-router-dom";
import { FiBell, FiAward, FiArrowRight, FiClock, FiMessageSquare } from "react-icons/fi";
import { relative } from "./utils";

type FeedEvent = { id: string; title: string; type: string; createdAt: string };

type Props = { events: FeedEvent[] };

export function HighlightsRail({ events }: Props) {
  const pinned = events.filter((e) => e.type === "ANNOUNCEMENT").slice(0, 3);
  const exams = events.filter((e) => e.type === "EXAM").slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="rounded-box border border-line bg-base-100 p-4">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <FiBell aria-hidden className="text-brand" />Pinned
        </h3>
        {pinned.length === 0 ? <p className="mt-3 text-sm text-muted">No announcements yet.</p> : (
          <ul className="mt-3 space-y-2">
            {pinned.map((e) => (
              <li key={e.id} className="rounded-box border border-line bg-base-200/40 p-3">
                <p className="line-clamp-2 text-sm font-semibold leading-snug">{e.title}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted"><FiClock aria-hidden size={11} />{relative(e.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-box border border-line bg-base-100 p-4">
        <h3 className="flex items-center gap-2 text-sm font-bold"><FiAward aria-hidden className="text-success" />Recent exams</h3>
        {exams.length === 0 ? <p className="mt-3 text-sm text-muted">Exam updates show here.</p> : (
          <ul className="mt-3 space-y-2">
            {exams.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-2 rounded-box border border-line bg-base-100 p-3">
                <span className="min-w-0"><span className="block truncate text-sm font-medium">{e.title}</span><span className="text-xs text-muted">{relative(e.createdAt)}</span></span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-box border border-line bg-base-100 p-4">
        <h3 className="text-sm font-bold">Quick links</h3>
        <div className="mt-3 grid gap-2">
          <Link to="/messages" className="btn btn-sm justify-between rounded-full border-line bg-base-100"><span className="flex items-center gap-2"><FiMessageSquare aria-hidden />Messages</span><FiArrowRight aria-hidden /></Link>
          <Link to="/schedule" className="btn btn-sm justify-between rounded-full border-line bg-base-100"><span className="flex items-center gap-2"><FiClock aria-hidden />Schedule</span><FiArrowRight aria-hidden /></Link>
          <Link to="/grades" className="btn btn-sm justify-between rounded-full border-line bg-base-100"><span className="flex items-center gap-2"><FiAward aria-hidden />Grades</span><FiArrowRight aria-hidden /></Link>
        </div>
      </div>
    </div>
  );
}
