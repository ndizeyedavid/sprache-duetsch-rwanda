import { FiSearch,FiX } from 'react-icons/fi';
import type { AssignmentsTab } from './constants';
import { STATUS_LABEL,TABS } from './constants';

type Props = {
  tab: AssignmentsTab; onTab: (tab: AssignmentsTab) => void; counts: Record<string, number>;
  search: string; onSearch: (value: string) => void;
  course: string; onCourse: (value: string) => void; courses: { code: string; title: string }[];
  status: string; onStatus: (value: string) => void;
};

export function AssignmentsToolbar({ tab, onTab, counts, search, onSearch, course, onCourse, courses, status, onStatus }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" aria-label="Assignment categories">
        {TABS.map((item) => <button key={item} type="button" aria-pressed={tab === item} onClick={() => onTab(item)} className={`btn btn-sm gap-2 rounded-full ${tab === item ? 'btn-neutral' : 'border-base-300 bg-base-100/70'}`}>
          {item === 'Done' ? 'Submitted' : item}<span className={`grid min-w-5 place-items-center rounded-full px-1.5 text-[10px] ${tab === item ? 'bg-neutral-content/15' : 'bg-base-200'}`}>{counts[item] ?? 0}</span>
        </button>)}
      </div>
      <div className="flex flex-wrap gap-2">
        <label className="input input-sm w-full rounded-full border-base-300 bg-base-100 sm:w-auto sm:min-w-56 sm:flex-1"><FiSearch aria-hidden className="shrink-0 text-base-content/50" /><input aria-label="Search assignments" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Find an assignment…" className="min-w-0 grow text-xs" />{search ? <button type="button" onClick={() => onSearch('')} aria-label="Clear search" className="btn btn-ghost btn-xs btn-circle"><FiX aria-hidden /></button> : null}</label>
        <select aria-label="Filter by course" value={course} onChange={(event) => onCourse(event.target.value)} className="select select-sm flex-1 rounded-full border-base-300 bg-base-100 text-xs sm:max-w-48"><option value="">All courses</option>{courses.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.title}</option>)}</select>
        <select aria-label="Filter by status" value={status} onChange={(event) => onStatus(event.target.value)} className="select select-sm flex-1 rounded-full border-base-300 bg-base-100 text-xs sm:max-w-40"><option value="">All statuses</option>{Object.entries(STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      </div>
    </div>
  );
}
