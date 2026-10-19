import { FiArrowRight,FiCheck,FiVolume2 } from 'react-icons/fi';
import { timeAgo } from '../notifications/notification-meta';
import { useAnnouncements } from './announcements-context';

/** Pinned on top of the home dashboard while any announcement is unread. */
export function AnnouncementBanner() {
  const state = useAnnouncements();
  if (!state || !state.items.length) return null;
  const { items, busy, markRead, openPopup } = state;
  return (
    <section aria-label="Unread announcements" className="hero-band mb-5 rounded-box p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <FiVolume2 aria-hidden className="text-lg" />
        <h2 className="text-sm font-bold uppercase tracking-wider">{items.length} unread announcement{items.length === 1 ? '' : 's'}</h2>
        <button type="button" onClick={openPopup} className="ml-auto inline-flex items-center gap-1 rounded-full bg-base-100 px-3 py-1 text-xs font-semibold text-primary">
          Read {items.length === 1 ? 'it' : 'all'} <FiArrowRight aria-hidden />
        </button>
      </div>
      <ul className="space-y-2">
        {items.slice(0, 3).map((item) => (
          <li key={item.id} className="flex items-start gap-3 rounded-box bg-base-100 p-3 text-base-content">
            <button type="button" onClick={openPopup} className="min-w-0 flex-1 text-left">
              <span className="block truncate text-sm font-semibold">{item.title}</span>
              <span className="block truncate text-xs text-muted">{item.body}</span>
              <span className="text-[0.6875rem] text-muted">{item.data?.from ? `${item.data.from} · ` : ''}{timeAgo(item.createdAt)}</span>
            </button>
            <button type="button" disabled={busy.includes(item.id)} onClick={() => void markRead(item.id)} aria-label={`Mark "${item.title}" as read`}
              className="btn btn-xs btn-primary shrink-0 rounded-full">
              {busy.includes(item.id) ? <span className="loading loading-spinner loading-xs" /> : <FiCheck aria-hidden />} Got it
            </button>
          </li>
        ))}
      </ul>
      {items.length > 3 ? <p className="mt-2 text-xs">+{items.length - 3} more — tap “Read all”.</p> : null}
    </section>
  );
}
