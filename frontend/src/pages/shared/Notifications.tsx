import { useEffect,useRef } from 'react';
import { FiBell,FiCheck,FiRefreshCw } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { heroAction,heroGhost } from '../../components/hero/hero-actions';
import { PageHero } from '../../components/hero/PageHero';
import { InboxToolbar } from '../../components/notifications/InboxToolbar';
import { NotificationRow } from '../../components/notifications/NotificationRow';
import { notificationLink } from '../../components/notifications/notification-links';
import { useUnreadNotifications } from '../../components/notifications/unread-context';
import { useNotificationInbox } from '../../components/notifications/useNotificationInbox';
import { Panel } from '../../components/ui/Panel';
import type { InboxNotification } from '../../lib/notifications';
import { useSession } from '../../lib/session';

/** Inbox for every role: list, mark read, mark all read, delete. */
export function Notifications() {
  const { count, refresh } = useUnreadNotifications();
  const { user } = useSession();
  const navigate = useNavigate();
  const inbox = useNotificationInbox(refresh);
  const { reload } = inbox;
  const lastCount = useRef(count);

  // A new notification arrived while the page is open: show it without a manual refresh.
  useEffect(() => {
    if (count > lastCount.current) reload();
    lastCount.current = count;
  }, [count, reload]);

  function open(item: InboxNotification, link: string) {
    void inbox.markRead(item);
    navigate(link);
  }

  const empty = inbox.filter === 'unread'
    ? { title: "You're all caught up", hint: 'No unread notifications. Switch to All to see older ones.' }
    : { title: 'No notifications yet', hint: 'Class changes, new assignments, payment reminders and messages will show up here.' };

  return (
    <div className="space-y-4">
      <PageHero eyebrow="Inbox" icon={FiBell} title="Notifications" art="announcements"
        description="Class changes, new assignments, payment reminders and messages — everything that needs your attention."
        meta={<span className="hero-chip hero-chip-solid">{count > 0 ? `${count > 99 ? '99+' : count} unread` : 'All caught up'}</span>}
        actions={<>
          <button type="button" onClick={() => void inbox.markAll()} disabled={inbox.markingAll || count === 0} className={`${heroAction} disabled:border-primary-content disabled:bg-primary-content disabled:text-primary`}>
            {inbox.markingAll ? <span className="loading loading-spinner loading-xs" /> : <FiCheck aria-hidden />}Mark all read
          </button>
          <button type="button" onClick={() => { reload(); refresh(); }} disabled={inbox.loading} className={`${heroGhost} disabled:border-primary-content disabled:bg-transparent disabled:text-primary-content`}>
            <FiRefreshCw aria-hidden className={inbox.loading ? 'animate-spin' : ''} />Refresh
          </button>
        </>} />
      <div className="mx-auto max-w-3xl space-y-4">
      <InboxToolbar filter={inbox.filter} onFilter={inbox.setFilter} unread={count} />
      {inbox.actionError ? <p role="alert" className="alert alert-error alert-soft text-sm">{inbox.actionError}</p> : null}

      {inbox.loading && inbox.rows.length === 0 ? <LoadingBlock label="Loading notifications…" /> : null}
      {inbox.error ? <ErrorBlock message={inbox.error} onRetry={reload} /> : null}
      {!inbox.loading && !inbox.error && inbox.rows.length === 0 ? <EmptyBlock title={empty.title} hint={empty.hint} /> : null}

      {inbox.rows.length > 0 && !inbox.error ? (
        <Panel padded={false} className="overflow-hidden">
          <ul className="divide-y divide-base-300">
            {inbox.rows.map(item => (
              <NotificationRow
                key={item.id}
                item={item}
                link={user ? notificationLink(item, user.role) : null}
                busy={inbox.busyId === item.id}
                onOpen={open}
                onMarkRead={item => void inbox.markRead(item)}
                onDelete={item => void inbox.remove(item)}
              />
            ))}
          </ul>
          {inbox.hasNext ? (
            <div className="border-t border-base-300 p-3 text-center">
              <button type="button" disabled={inbox.loadingMore} onClick={() => void inbox.loadMore()} className="btn btn-sm rounded-full">
                {inbox.loadingMore ? <span className="loading loading-spinner loading-xs" /> : null}Load older
              </button>
            </div>
          ) : null}
        </Panel>
      ) : null}
      </div>
    </div>
  );
}
