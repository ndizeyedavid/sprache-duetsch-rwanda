import { FiSearch,FiX } from "react-icons/fi";
import type { Filter } from "./constants";
import { FILTERS,FILTER_ICON } from "./constants";

type Props = {
  total: number;
  counts: Record<string, number>;
  filter: Filter;
  onFilter: (f: Filter) => void;
  q: string;
  onQ: (v: string) => void;
  fetching: boolean;
};

/** Type filter pills + search for the activity feed (sits in the page hero's white strip). */
export function ActivityFilters({ total, counts, filter, onFilter, q, onQ, fetching }: Props) {
  return (
    <div className="space-y-3">
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
        {FILTERS.map((name) => {
          const Icon = FILTER_ICON[name];
          const active = filter === name;
          const c = name === "All" ? total : (counts[name.toUpperCase()] ?? 0);
          return (
            <button
              key={name}
              type="button"
              onClick={() => onFilter(name)}
              aria-pressed={active}
              disabled={fetching}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:opacity-60 ${active ? "border-brand bg-brand text-primary-content" : "border-line bg-base-100 text-muted hover:border-brand hover:text-ink"}`}
            >
              {active && fetching ? <span className="loading loading-spinner loading-xs" aria-hidden /> : <Icon aria-hidden className="text-xs" />}
              {name}
              {c > 0 ? <span className={`rounded-full px-1.5 py-0.5 text-[0.6875rem] font-bold ${active ? "bg-base-100 text-primary" : "bg-base-200 text-base-content"}`}>{c}</span> : null}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <FiSearch aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input value={q} onChange={(e) => onQ(e.target.value)} placeholder="Search activity…" aria-label="Search activity" className="input input-sm w-full rounded-full border-line bg-base-100 pl-9 pr-9 text-sm" />
        {q ? <button type="button" onClick={() => onQ("")} className="btn btn-ghost btn-xs btn-circle absolute right-1 top-1/2 -translate-y-1/2" aria-label="Clear"><FiX aria-hidden /></button> : null}
      </div>
    </div>
  );
}
