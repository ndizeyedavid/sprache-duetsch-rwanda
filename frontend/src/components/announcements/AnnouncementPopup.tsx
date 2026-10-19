import { FiVolume2 } from 'react-icons/fi';
import { Dialog } from '../ui/overlay/Dialog';
import { AnnouncementCard } from './AnnouncementCard';
import { useAnnouncements } from './announcements-context';

/** Opens by itself after sign-in (or when a new announcement arrives) until each one is read. */
export function AnnouncementPopup() {
  const state = useAnnouncements();
  if (!state) return null;
  const { items, busy, popupOpen, markRead, markAll, snooze } = state;
  const many = items.length > 1;
  return (
    <Dialog open={popupOpen} onClose={snooze} icon={FiVolume2} size="md"
      title={many ? `${items.length} new announcements` : 'New announcement'}
      subtitle="From your school — please read before you continue."
      footer={
        <>
          <button type="button" onClick={snooze} className="btn btn-ghost btn-sm rounded-full">Remind me later</button>
          {many ? <button type="button" disabled={busy.length > 0} onClick={() => void markAll()} className="btn btn-primary btn-sm ml-auto rounded-full">Mark all as read</button> : null}
        </>
      }>
      <div className="space-y-3">
        {items.map((item) => <AnnouncementCard key={item.id} item={item} busy={busy.includes(item.id)} onRead={() => void markRead(item.id)} />)}
      </div>
    </Dialog>
  );
}
