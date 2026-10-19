import type { ApplicationStatus } from '../../lib/admissions-types';
import { QUEUE_TABS } from './constants';

type Props = {
  active: ApplicationStatus;
  counts: Record<ApplicationStatus, number> | null;
  onChange: (status: ApplicationStatus) => void;
};

/** Pipeline tabs with live counts; scrolls sideways on phones. */
export function ApplicationTabs({ active, counts, onChange }: Props) {
  return (
    <div role="tablist" aria-label="Application status" className="scrollbar-none flex items-center gap-5 overflow-x-auto border-b border-line">
      {QUEUE_TABS.map((tab) => {
        const selected = tab.status === active;
        const count = counts?.[tab.status];
        return (
          <button key={tab.status} type="button" role="tab" aria-selected={selected} onClick={() => onChange(tab.status)}
            className={`-mb-px flex shrink-0 items-center gap-1.5 border-b-2 pb-3 text-sm font-medium transition-colors ${
              selected ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-ink'}`}>
            {tab.label}
            {count !== undefined ? (
              <span className={`rounded-full px-1.5 text-[0.6875rem] ${selected ? 'bg-brand text-white' : 'bg-base-200 text-muted'}`}>{count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
