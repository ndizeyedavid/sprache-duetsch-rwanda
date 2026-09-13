import { useState } from 'react';
import { Panel } from '../../components/ui/Panel';
import { ActivityRow } from '../../components/cards/ActivityRow';
import { KebabMenu } from '../../components/ui/KebabMenu';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { activityFeed, activityYesterday } from '../../data/mock';

const TABS = ['Following', 'You'];
const FILTERS = ['All Type', 'Files', 'Mentions', 'Groups'];

export function Activity() {
  const [tab, setTab] = useState(TABS[0]);
  const [filter, setFilter] = useState(FILTERS[0]);

  return (
    <Panel>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => setTab(TABS[0])}
            className={`relative pb-2 text-sm font-medium ${
              tab === TABS[0] ? 'border-b-2 border-brand text-brand' : 'text-muted'
            }`}
          >
            {TABS[0]}
            <span className="absolute -right-2 top-0 size-1.5 rounded-full bg-coral" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setTab(TABS[1])}
            className={`pb-2 text-sm font-medium ${
              tab === TABS[1] ? 'border-b-2 border-brand text-brand' : 'text-muted'
            }`}
          >
            {TABS[1]}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-[11px] text-muted sm:block">View:</span>
          <SegmentedControl options={FILTERS} value={filter} onChange={setFilter} ariaLabel="Activity filter" />
          <KebabMenu label="Activity options" />
        </div>
      </div>

      <div className="pt-5">
        <h3 className="mb-4 text-sm font-semibold">Today</h3>
        <ul className="relative border-l border-dashed border-line pl-5">
          {activityFeed.map((item) => (
            <ActivityRow key={item.id} item={item} />
          ))}
        </ul>

        <h3 className="mb-4 mt-4 text-sm font-semibold">Yesterday</h3>
        <ul className="relative border-l border-dashed border-line pl-5">
          {activityYesterday.map((item) => (
            <ActivityRow key={item.id} item={item} />
          ))}
        </ul>
      </div>
    </Panel>
  );
}
