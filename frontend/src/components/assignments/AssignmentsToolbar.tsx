import { FiSearch } from "react-icons/fi";
import { TABS } from "./constants";
import type { AssignmentsTab } from "./constants";

type Props = {
  tab: AssignmentsTab;
  onTab: (t: AssignmentsTab) => void;
  counts: Record<string, number>;
  search: string;
  onSearch: (v: string) => void;
  course: string;
  onCourse: (v: string) => void;
  courses: { code: string; title: string }[];
  status: string;
  onStatus: (v: string) => void;
};

export function AssignmentsToolbar({ tab, onTab, counts, search, onSearch, course, onCourse, courses, status, onStatus }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button key={t} type="button" onClick={() => onTab(t)} className={`rounded-full border px-3 py-1.5 text-xs font-medium ${tab === t ? "border-brand bg-brand text-white" : "border-line bg-base-100 text-muted hover:text-ink"}`}>
            {t} {counts[t] ? <span className="ml-1 rounded-full bg-black/10 px-1.5 py-0.5 text-[11px]">{counts[t]}</span> : null}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <label className="input flex max-w-xs items-center gap-2">
          <FiSearch aria-hidden className="opacity-50" />
          <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search assignment" className="grow" />
        </label>
        <select value={course} onChange={(e) => onCourse(e.target.value)} className="select max-w-[200px]">
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c.code} value={c.code}>{c.code} · {c.title}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => onStatus(e.target.value)} className="select max-w-[160px]">
          <option value="">All status</option>
          <option value="NOT_STARTED">Not started</option>
          <option value="MISSING">Missing</option>
          <option value="OVERDUE">Overdue</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="GRADED">Graded</option>
        </select>
      </div>
    </div>
  );
}
