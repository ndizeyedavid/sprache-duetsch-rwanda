import { FiCheck,FiVolume2 } from 'react-icons/fi';
import type { Announcement } from '../../lib/announcements';
import { timeAgo } from '../notifications/notification-meta';

type Props = { item: Announcement; busy: boolean; onRead: () => void };

/** One announcement in full: headline, who sent it and when, the whole message, and "Got it". */
export function AnnouncementCard({ item, busy, onRead }: Props) {
  return (
    <article className="rounded-box border border-primary bg-base-100 p-4">
      <header className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-content"><FiVolume2 aria-hidden /></span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold leading-snug">{item.title}</h3>
          <p className="text-[0.6875rem] text-muted">{item.data?.from ? `${item.data.from} · ` : ''}{timeAgo(item.createdAt)}</p>
        </div>
      </header>
      {item.body ? <p className="mt-3 whitespace-pre-line text-sm leading-6">{item.body}</p> : null}
      <div className="mt-3 flex justify-end">
        <button type="button" disabled={busy} onClick={onRead} className="btn btn-sm btn-primary rounded-full">
          {busy ? <span className="loading loading-spinner loading-xs" /> : <FiCheck aria-hidden />} Got it
        </button>
      </div>
    </article>
  );
}
