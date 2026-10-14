import { FiBell } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import type { InboxNotification } from '../../lib/notifications';
import { useSession } from '../../lib/session';
import { NotificationPreview } from './NotificationPreview';
import { NOTIFICATIONS_PATH,notificationLink } from './notification-links';
import { badgeLabel } from './notification-meta';
import { useUnreadNotifications } from './unread-context';
import { useBellPreview } from './useBellPreview';

/** Closes the focus-driven daisyUI dropdown. */
function closeDropdown() {
  const active = document.activeElement;
  if (active instanceof HTMLElement) active.blur();
}

/** Topbar bell for every role: live unread badge + latest notifications on open. */
export function NotificationBell() {
  const { count, refresh } = useUnreadNotifications();
  const { user } = useSession();
  const navigate = useNavigate();
  const preview = useBellPreview(refresh);
  const label = badgeLabel(count);

  function open(item: InboxNotification) {
    closeDropdown();
    preview.markRead(item);
    navigate(user ? notificationLink(item, user.role) ?? NOTIFICATIONS_PATH : NOTIFICATIONS_PATH);
  }

  return (
    <div className="dropdown dropdown-end">
      {/* daisyUI: a focusable div (not <button>) so Safari opens the focus dropdown on tap. */}
      <div
        tabIndex={0}
        role="button"
        aria-haspopup="dialog"
        aria-label={label ? `Notifications, ${label} unread` : 'Notifications'}
        onFocus={() => void preview.load()}
        className="btn btn-ghost btn-sm btn-circle"
      >
        <span className="indicator">
          {label ? (
            <span className="indicator-item badge badge-xs min-w-4 rounded-full border-0 bg-brand px-1 text-[10px] font-bold text-white">
              {label}
            </span>
          ) : null}
          <FiBell aria-hidden className="text-lg" />
        </span>
      </div>
      <div
        tabIndex={0}
        role="dialog"
        aria-label="Latest notifications"
        className="dropdown-content fixed inset-x-3 top-[4.75rem] z-40 overflow-hidden rounded-box border border-base-300 bg-base-100 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96"
      >
        <NotificationPreview
          rows={preview.rows}
          loading={preview.loading}
          error={preview.error}
          unread={count}
          markingAll={preview.markingAll}
          onRetry={() => void preview.load()}
          onOpen={open}
          onMarkAll={() => void preview.markAll()}
          onClose={closeDropdown}
        />
      </div>
    </div>
  );
}
