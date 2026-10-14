import { useCallback,useRef,useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import type { InboxNotification } from '../../lib/notifications';
import { listInbox,markInboxAllRead,markInboxRead } from '../../lib/notifications';

const PREVIEW_SIZE = 5;

const markedRead = (row: InboxNotification, stamp: string): InboxNotification => (row.readAt ? row : { ...row, readAt: stamp });

/** Latest few notifications, fetched only when the bell opens (nothing loads on page view). */
export function useBellPreview(onChanged: () => void) {
  const [rows, setRows] = useState<InboxNotification[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const busy = useRef(false);

  const load = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    setError(null);
    try {
      setRows((await listInbox({ pageSize: PREVIEW_SIZE })).rows);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load notifications.'));
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }, []);

  const markRead = useCallback((item: InboxNotification) => {
    if (item.readAt) return;
    const stamp = new Date().toISOString();
    setRows(current => current?.map(row => (row.id === item.id ? markedRead(row, stamp) : row)) ?? current);
    void markInboxRead(item.id).then(onChanged, () => undefined);
  }, [onChanged]);

  const markAll = useCallback(async () => {
    setMarkingAll(true);
    setError(null);
    try {
      await markInboxAllRead();
      const stamp = new Date().toISOString();
      setRows(current => current?.map(row => markedRead(row, stamp)) ?? current);
      onChanged();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not mark notifications as read.'));
    } finally {
      setMarkingAll(false);
    }
  }, [onChanged]);

  return { rows, loading, error, markingAll, load, markRead, markAll };
}
