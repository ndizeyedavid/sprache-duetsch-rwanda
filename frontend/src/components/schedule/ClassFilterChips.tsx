import { FiSearch,FiX } from 'react-icons/fi';

type ClassItem = { id: string; name: string; code: string; level?: { code: string } };

type Props = {
 classes: ClassItem[];
 selected: string | null;
 onSelect: (id: string | null) => void;
 search: string;
 onSearch: (v: string) => void;
 status: string;
 onStatus: (v: string) => void;
};

export function ClassFilterChips({ classes, selected, onSelect, search, onSearch, status, onStatus }: Props) {
 return (
 <div className="space-y-2">
 <div className="flex flex-wrap items-center gap-2">
 <button type="button" onClick={() => onSelect(null)} className={`btn btn-xs rounded-full ${!selected ? 'btn-neutral border-0' : 'border-line bg-base-200'}`}>All classes</button>
 {classes.map((c) => (
 <button key={c.id} type="button" onClick={() => onSelect(c.id)} className={`btn btn-xs rounded-full ${selected === c.id ? 'btn-neutral border-0' : 'border-line bg-base-200'}`}>
 {c.name} {c.level?.code ? `· ${c.level.code}` : ''}
 </button>
 ))}
 </div>
 <div className="flex flex-wrap items-center gap-2">
 <div className="relative min-w-0 flex-1">
 <FiSearch aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
 <input aria-label="Search sessions" value={search} onChange={(e) => onSearch(e.currentTarget.value)} placeholder="Search title…" className="input input-sm w-full rounded-full border-line bg-base-100 pl-9 pr-8" />
 {search ? <button type="button" onClick={() => onSearch('')} aria-label="Clear search" className="btn btn-ghost btn-xs btn-circle absolute right-1 top-1/2 -translate-y-1/2"><FiX aria-hidden /></button> : null}
 </div>
 <select aria-label="Filter session status" value={status} onChange={(e) => onStatus(e.currentTarget.value)} className="select select-sm w-full rounded-full sm:w-48 border-line bg-base-100">
 <option value="">All statuses</option>
 <option value="SCHEDULED">Scheduled</option>
 <option value="LIVE">Live</option>
 <option value="COMPLETED">Completed</option>
 <option value="CANCELLED">Cancelled</option>
 <option value="RESCHEDULED">Rescheduled</option>
 </select>
 </div>
 </div>
 );
}
