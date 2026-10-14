import { FiCheck,FiRefreshCw } from 'react-icons/fi';
import type { InboxFilter } from './useNotificationInbox';

type Props = {
  filter: InboxFilter;
  onFilter: (filter: InboxFilter) => void;
  unread: number;
  markingAll: boolean;
  refreshing: boolean;
  onMarkAll: () => void;
  onRefresh: () => void;
};

const FILTERS: { id: InboxFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
];

/** Filter tabs + bulk actions above the inbox. */
export function InboxToolbar({ filter, onFilter, unread, markingAll, refreshing, onMarkAll, onRefresh }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div role="tablist" aria-label="Filter notifications" className="tabs tabs-box tabs-sm">
        {FILTERS.map(item => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={filter === item.id}
            onClick={() => onFilter(item.id)}
            className={`tab gap-1.5 ${filter === item.id ? 'tab-active' : ''}`}
          >
            {item.label}
            {item.id === 'unread' && unread > 0 ? <span className="badge badge-xs border-0 bg-brand text-white">{unread > 99 ? '99+' : unread}</span> : null}
          </button>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button type="button" onClick={onRefresh} disabled={refreshing} aria-label="Refresh notifications" className="btn btn-ghost btn-sm btn-circle">
          <FiRefreshCw aria-hidden className={refreshing ? 'animate-spin' : ''} />
        </button>
        <button type="button" onClick={onMarkAll} disabled={markingAll || unread === 0} className="btn btn-sm gap-1 rounded-full border-base-300 bg-base-100">
          {markingAll ? <span className="loading loading-spinner loading-xs" /> : <FiCheck aria-hidden />}
          Mark all read
        </button>
      </div>
    </div>
  );
}
