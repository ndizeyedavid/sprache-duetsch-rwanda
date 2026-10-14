import { createContext,useContext } from 'react';

export type UnreadNotifications = {
  /** Unread in-app notifications for the signed-in user. */
  count: number;
  /** Re-read the count now (after mark read / delete / mark all). */
  refresh: () => void;
};

export const UnreadNotificationsContext = createContext<UnreadNotifications>({ count: 0, refresh: () => undefined });

/** Shared by the topbar bell, the sidebar badge and the inbox page so there is one poller. */
export function useUnreadNotifications(): UnreadNotifications {
  return useContext(UnreadNotificationsContext);
}
