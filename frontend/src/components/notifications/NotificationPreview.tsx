import { FiCheck } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { InboxNotification } from '../../lib/notifications';
import { NOTIFICATIONS_PATH } from './notification-links';
import { notificationMeta,timeAgo } from './notification-meta';

type Props = {
  rows: InboxNotification[] | null;
  loading: boolean;
  error: string | null;
  unread: number;
  markingAll: boolean;
  onRetry: () => void;
  onOpen: (item: InboxNotification) => void;
  onMarkAll: () => void;
  onClose: () => void;
};

/** The bell's dropdown: the latest few notifications and a way to the full inbox. */
export function NotificationPreview({ rows, loading, error, unread, markingAll, onRetry, onOpen, onMarkAll, onClose }: Props) {
  return (
    <div className="flex max-h-[70vh] flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-base-300 px-3 py-2.5">
        <p className="text-sm font-semibold">Notifications</p>
        {unread > 0 ? (
          <button type="button" onClick={onMarkAll} disabled={markingAll} className="btn btn-ghost btn-xs gap-1 text-brand">
            {markingAll ? <span className="loading loading-spinner loading-xs" /> : <FiCheck aria-hidden />}Mark all read
          </button>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading && !rows ? <p role="status" className="px-3 py-6 text-center text-sm text-muted">Loading…</p> : null}
        {error ? (
          <div role="alert" className="flex items-center justify-between gap-2 px-3 py-4 text-sm text-error">
            <span>{error}</span>
            <button type="button" className="btn btn-xs" onClick={onRetry}>Retry</button>
          </div>
        ) : null}
        {rows && rows.length === 0 && !error ? (
          <p className="px-3 py-8 text-center text-sm text-muted">You're all caught up.</p>
        ) : null}
        {rows && rows.length > 0 ? (
          <ul className="divide-y divide-base-300">
            {rows.map(item => {
              const { icon: Icon, label } = notificationMeta(item.type);
              return (
                <li key={item.id}>
                  <button type="button" onClick={() => onOpen(item)} className="flex w-full items-start gap-3 px-3 py-3 text-left hover:bg-base-200">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-base-200 text-muted">
                      <Icon aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-sm ${item.readAt ? 'font-medium' : 'font-semibold'}`}>{item.title}</span>
                      {item.body ? <span className="mt-0.5 line-clamp-2 block text-xs text-muted">{item.body}</span> : null}
                      <span className="mt-1 block text-[11px] text-muted">{label} · {timeAgo(item.createdAt)}</span>
                    </span>
                    {item.readAt ? null : <span aria-label="Unread" className="mt-2 size-2 shrink-0 rounded-full bg-brand" />}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <Link to={NOTIFICATIONS_PATH} onClick={onClose} className="border-t border-base-300 px-3 py-2.5 text-center text-sm font-semibold text-brand hover:bg-base-200">
        See all notifications
      </Link>
    </div>
  );
}
