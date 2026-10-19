import type { InboxFilter } from './useNotificationInbox';

type Props = {
  filter: InboxFilter;
  onFilter: (filter: InboxFilter) => void;
  unread: number;
};

const FILTERS: { id: InboxFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
];

/** All / Unread filter tabs above the inbox (bulk actions live in the page hero). */
export function InboxToolbar({ filter, onFilter, unread }: Props) {
  return (
    <div role="tablist" aria-label="Filter notifications" className="tabs tabs-box tabs-sm w-fit">
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
  );
}
