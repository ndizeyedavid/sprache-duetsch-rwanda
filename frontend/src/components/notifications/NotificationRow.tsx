import { FiArrowRight,FiCheck,FiTrash2 } from 'react-icons/fi';
import type { InboxNotification } from '../../lib/notifications';
import { isoDate } from '../../lib/services/iso-date';
import { notificationMeta,timeAgo } from './notification-meta';

type Props = {
  item: InboxNotification;
  link: string | null;
  busy: boolean;
  onOpen: (item: InboxNotification, link: string) => void;
  onMarkRead: (item: InboxNotification) => void;
  onDelete: (item: InboxNotification) => void;
};

/** One inbox row: what happened, when, and the three things you can do with it. */
export function NotificationRow({ item, link, busy, onOpen, onMarkRead, onDelete }: Props) {
  const { icon: Icon, label } = notificationMeta(item.type);
  const unread = !item.readAt;
  return (
    <li className={`flex gap-3 px-4 py-4 sm:px-5 ${unread ? 'bg-base-200' : ''}`}>
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${unread ? 'bg-brand text-white' : 'bg-base-200 text-muted'}`}>
        <Icon aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className={`min-w-0 flex-1 text-sm leading-snug ${unread ? 'font-semibold' : 'font-medium'}`}>{item.title}</p>
          {unread ? <span aria-label="Unread" className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" /> : null}
        </div>
        {item.body ? <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted">{item.body}</p> : null}
        <p className="mt-1.5 text-xs text-muted">
          <span className="font-medium">{label}</span> · <time dateTime={item.createdAt} title={isoDate(item.createdAt)}>{timeAgo(item.createdAt)}</time>
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {link ? (
            <button type="button" onClick={() => onOpen(item, link)} className="btn btn-xs rounded-full border-0 bg-brand text-white hover:bg-brand">
              Open<FiArrowRight aria-hidden />
            </button>
          ) : null}
          {unread ? (
            <button type="button" onClick={() => onMarkRead(item)} className="btn btn-ghost btn-xs rounded-full border border-base-300">
              <FiCheck aria-hidden />Mark read
            </button>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={() => onDelete(item)}
            aria-label={`Delete notification: ${item.title}`}
            className="btn btn-ghost btn-xs ml-auto rounded-full text-muted hover:text-error"
          >
            {busy ? <span className="loading loading-spinner loading-xs" /> : <FiTrash2 aria-hidden />}
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>
    </li>
  );
}
