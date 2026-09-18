import { FiSearch } from "react-icons/fi";
import { TABS } from "./constants";
import type { PeopleTab } from "./constants";

type Props = {
  tab: PeopleTab;
  onTab: (t: PeopleTab) => void;
  counts: Record<PeopleTab, number>;
  search: string;
  onSearch: (v: string) => void;
  groupFilter: string;
  onGroupFilter: (v: string) => void;
  groups: { id: string; name: string }[];
};

export function PeopleToolbar({ tab, onTab, counts, search, onSearch, groupFilter, onGroupFilter, groups }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="tabs tabs-boxed bg-base-200 p-1">
          {TABS.map((t) => (
            <button key={t} type="button" onClick={() => onTab(t)} className={`tab tab-sm ${tab === t ? "tab-active bg-brand text-white" : ""}`}>
              {t}
              <span className="ml-1.5 rounded-full bg-black/10 px-1.5 py-0.5 text-[10px]">{counts[t]}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <label className="input flex max-w-xs items-center gap-2">
          <FiSearch aria-hidden className="opacity-50" />
          <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search name or email" className="grow" />
        </label>
        <select value={groupFilter} onChange={(e) => onGroupFilter(e.target.value)} className="select max-w-[200px]">
          <option value="">All groups</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
