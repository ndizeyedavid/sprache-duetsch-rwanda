import type { ReactNode } from 'react';
import { useCallback,useEffect,useMemo,useState } from 'react';
import type { Announcement } from '../../lib/announcements';
import { listUnreadAnnouncements,markAnnouncementRead } from '../../lib/announcements';
import { useUnreadNotifications } from '../notifications/unread-context';
import { AnnouncementsContext } from './announcements-context';

const POLL_MS = 120_000;
const SNOOZE_KEY = 'sparch.announcements.snoozed';

const readSnoozed = (): string[] => {
  try { return JSON.parse(sessionStorage.getItem(SNOOZE_KEY) ?? '[]') as string[]; } catch { return []; }
};

/**
 * Loads unread announcements on sign-in (and every two minutes / on tab focus). Any announcement the
 * member has not snoozed opens the pop-up by itself, so nothing slips by unseen.
 */
export function AnnouncementsProvider({ children }: { children: ReactNode }) {
  const unread = useUnreadNotifications();
  const [items, setItems] = useState<Announcement[]>([]);
  const [busy, setBusy] = useState<string[]>([]);
  const [snoozed, setSnoozed] = useState<string[]>(readSnoozed);
  const [forced, setForced] = useState(false);

  const load = useCallback(() => {
    listUnreadAnnouncements().then(setItems).catch(() => undefined);
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, POLL_MS);
    const onVisible = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, [load]);

  const markRead = useCallback(async (id: string) => {
    setBusy((current) => [...current, id]);
    try {
      await markAnnouncementRead(id);
      setItems((current) => current.filter((item) => item.id !== id));
      unread.refresh();
    } finally {
      setBusy((current) => current.filter((value) => value !== id));
    }
  }, [unread]);

  const markAll = useCallback(async () => {
    await Promise.all(items.map((item) => markRead(item.id)));
    setForced(false);
  }, [items, markRead]);

  const snooze = useCallback(() => {
    const ids = [...new Set([...snoozed, ...items.map((item) => item.id)])];
    sessionStorage.setItem(SNOOZE_KEY, JSON.stringify(ids));
    setSnoozed(ids);
    setForced(false);
  }, [items, snoozed]);

  const fresh = items.some((item) => !snoozed.includes(item.id));
  const popupOpen = items.length > 0 && (forced || fresh);
  const value = useMemo(() => ({ items, busy, markRead, markAll, popupOpen, openPopup: () => setForced(true), snooze }),
    [items, busy, markRead, markAll, popupOpen, snooze]);
  return <AnnouncementsContext.Provider value={value}>{children}</AnnouncementsContext.Provider>;
}
