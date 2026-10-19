import { createContext,useContext } from 'react';
import type { Announcement } from '../../lib/announcements';

export type AnnouncementsState = {
  /** Unread announcements, newest first. */
  items: Announcement[];
  /** Ids being marked as read right now. */
  busy: string[];
  markRead: (id: string) => Promise<void>;
  markAll: () => Promise<void>;
  /** Pop-up visibility (opened automatically for new announcements, or from the banner). */
  popupOpen: boolean;
  openPopup: () => void;
  /** "Remind me later": hide the pop-up for these announcements until the next sign-in/tab. */
  snooze: () => void;
};

export const AnnouncementsContext = createContext<AnnouncementsState | null>(null);

export function useAnnouncements(): AnnouncementsState | null {
  return useContext(AnnouncementsContext);
}
