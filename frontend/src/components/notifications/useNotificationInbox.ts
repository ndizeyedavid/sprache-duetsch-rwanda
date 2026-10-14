import { useCallback,useEffect,useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import type { InboxNotification } from '../../lib/notifications';
import { deleteInboxNotification,listInbox,markInboxAllRead,markInboxRead } from '../../lib/notifications';

export type InboxFilter = 'all' | 'unread';

const PAGE_SIZE = 20;

function mergeRows(current: InboxNotification[], next: InboxNotification[]): InboxNotification[] {
  const seen = new Set(current.map(row => row.id));
  return [...current, ...next.filter(row => !seen.has(row.id))];
}

/** Full inbox state: paginated list, filter, and optimistic read/delete actions. */
export function useNotificationInbox(onChanged: () => void) {
  const [filter, setFilter] = useState<InboxFilter>('all');
  const [rows, setRows] = useState<InboxNotification[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [nonce, setNonce] = useState(0);
  const unreadOnly = filter === 'unread';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listInbox({ page: 1, pageSize: PAGE_SIZE, unread: unreadOnly })
      .then(result => { if (!cancelled) { setRows(result.rows); setHasNext(result.hasNext); setPage(1); } })
      .catch((err: unknown) => { if (!cancelled) setError(apiErrorMessage(err, 'Could not load notifications.')); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [unreadOnly, nonce]);

  const reload = useCallback(() => setNonce(value => value + 1), []);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    setActionError(null);
    try {
      const result = await listInbox({ page: page + 1, pageSize: PAGE_SIZE, unread: unreadOnly });
      setRows(current => mergeRows(current, result.rows));
      setHasNext(result.hasNext);
      setPage(page + 1);
    } catch (err) {
      setActionError(apiErrorMessage(err, 'Could not load more notifications.'));
    } finally {
      setLoadingMore(false);
    }
  }, [page, unreadOnly]);

  const markRead = useCallback(async (item: InboxNotification) => {
    if (item.readAt) return;
    const stamp = new Date().toISOString();
    setRows(current => current.map(row => (row.id === item.id ? { ...row, readAt: stamp } : row)));
    try {
      await markInboxRead(item.id);
      onChanged();
    } catch (err) {
      setRows(current => current.map(row => (row.id === item.id ? { ...row, readAt: null } : row)));
      setActionError(apiErrorMessage(err, 'Could not mark it as read.'));
    }
  }, [onChanged]);

  const remove = useCallback(async (item: InboxNotification) => {
    setBusyId(item.id);
    setActionError(null);
    try {
      await deleteInboxNotification(item.id);
      setRows(current => current.filter(row => row.id !== item.id));
      onChanged();
    } catch (err) {
      setActionError(apiErrorMessage(err, 'Could not delete the notification.'));
    } finally {
      setBusyId(null);
    }
  }, [onChanged]);

  const markAll = useCallback(async () => {
    setMarkingAll(true);
    setActionError(null);
    try {
      await markInboxAllRead();
      const stamp = new Date().toISOString();
      setRows(current => current.map(row => (row.readAt ? row : { ...row, readAt: stamp })));
      onChanged();
    } catch (err) {
      setActionError(apiErrorMessage(err, 'Could not mark everything as read.'));
    } finally {
      setMarkingAll(false);
    }
  }, [onChanged]);

  return { filter, setFilter, rows, hasNext, loading, loadingMore, error, actionError, busyId, markingAll, reload, loadMore, markRead, remove, markAll };
}
