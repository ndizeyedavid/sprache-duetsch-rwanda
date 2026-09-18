import { FiActivity, FiSearch, FiX } from "react-icons/fi";
import { FILTERS, FILTER_ICON } from "./constants";
import type { Filter } from "./constants";

type Props = {
  total: number;
  counts: Record<string, number>;
  filter: Filter;
  onFilter: (f: Filter) => void;
  q: string;
  onQ: (v: string) => void;
  fetching: boolean;
};

export function ActivityHeader({ total, counts, filter, onFilter, q, onQ, fetching }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <span className="flex size-8 items-center justify-center rounded-full bg-brand text-white">
              <FiActivity aria-hidden size={14} />
            </span>
            Activity
          </h1>
          <p className="mt-1 text-sm text-muted">Updates from your classes, exams, attendance and payments.</p>
        </div>
        <span className="rounded-full bg-base-200 px-3 py-1 text-xs font-medium">{total} updates</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
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
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:opacity-60 ${active ? "border-brand bg-brand text-white" : "border-line bg-base-100 text-muted hover:border-brand/20 hover:text-ink"}`}
            >
              {active && fetching ? <span className="loading loading-spinner loading-xs" aria-hidden /> : <Icon aria-hidden className="text-xs" />}
              {name}
              {c > 0 ? <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${active ? "bg-white/20" : "bg-base-200"}`}>{c}</span> : null}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <FiSearch aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input value={q} onChange={(e) => onQ(e.target.value)} placeholder="Search activity…" className="input w-full rounded-full border-line bg-base-100 pl-9 pr-9 text-sm" />
        {q ? <button type="button" onClick={() => onQ("")} className="btn btn-ghost btn-xs btn-circle absolute right-1 top-1/2 -translate-y-1/2" aria-label="Clear"><FiX aria-hidden /></button> : null}
      </div>
    </div>
  );
}
