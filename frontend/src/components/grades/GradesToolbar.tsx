import { FiDownload, FiSearch } from "react-icons/fi";

type Props = {
  search: string;
  onSearch: (v: string) => void;
  course: string;
  onCourse: (v: string) => void;
  courses: { code: string; title: string }[];
  status: string;
  onStatus: (v: string) => void;
  whatIf: boolean;
  onWhatIf: (v: boolean) => void;
  onExport: () => void;
};

export function GradesToolbar({ search, onSearch, course, onCourse, courses, status, onStatus, whatIf, onWhatIf, onExport }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="input flex items-center gap-2 max-w-xs">
        <FiSearch aria-hidden className="opacity-50" />
        <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search assignment" className="grow" />
      </label>
      <select value={course} onChange={(e) => onCourse(e.target.value)} className="select max-w-[180px]"><option value="">All courses</option>{courses.map((c) => <option key={c.code} value={c.code}>{c.code} · {c.title}</option>)}</select>
      <select value={status} onChange={(e) => onStatus(e.target.value)} className="select max-w-[160px]"><option value="">All status</option><option value="graded">Graded</option><option value="pending">Pending</option><option value="missing">Not started</option></select>
      <label className="flex items-center gap-2 rounded-full border border-line bg-base-100 px-3 py-2 text-xs"><input type="checkbox" className="toggle toggle-xs toggle-primary" checked={whatIf} onChange={(e) => onWhatIf(e.target.checked)} />What-if</label>
      <button type="button" onClick={onExport} className="btn btn-sm btn-ghost gap-1"><FiDownload aria-hidden />Export</button>
    </div>
  );
}
