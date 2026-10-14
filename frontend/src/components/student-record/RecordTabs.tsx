import type { RecordAccess,RecordTab } from './constants';
import { visibleTabs } from './utils';

type Props = {
  active: RecordTab;
  access: RecordAccess;
  onChange: (tab: RecordTab) => void;
  counts: Partial<Record<RecordTab, number>>;
};

export function RecordTabs({ active, access, onChange, counts }: Props) {
  return (
    <div role="tablist" aria-label="Student record sections" className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {visibleTabs(access).map((tab) => {
        const selected = tab.key === active;
        const count = counts[tab.key];
        return (
          <button
            key={tab.key}
            id={`record-tab-${tab.key}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`record-panel-${tab.key}`}
            onClick={() => onChange(tab.key)}
            className={`btn btn-sm shrink-0 gap-2 rounded-full ${selected ? 'border-0 bg-brand text-white hover:bg-brand' : 'btn-ghost border border-line bg-base-100'}`}
          >
            {tab.label}
            {count === undefined ? null : (
              <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${selected ? 'bg-white text-brand' : 'bg-base-200 text-muted'}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
