import type { ReactNode } from 'react';
import { useCallback,useEffect,useMemo,useRef,useState } from 'react';
import { getUnreadNotificationCount } from '../../lib/notifications';
import { UnreadNotificationsContext } from './unread-context';

const POLL_MS = 60_000;
/** Focus + visibilitychange both fire on a tab switch; skip the second call. */
const MIN_GAP_MS = 5_000;
/** Survives layout remounts between route groups so the badge never flickers back to 0. */
let lastKnownCount = 0;

/**
 * Polls the unread count once a minute while the tab is visible, and refreshes
 * as soon as the user comes back to the tab. One tiny request, no payloads.
 */
export function UnreadNotificationsProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(lastKnownCount);
  const inFlight = useRef(false);
  const queued = useRef(false);
  const lastAt = useRef(0);

  const load = useCallback(function run(force: boolean) {
    // A forced refresh during a poll re-runs afterwards so the badge never shows a pre-action count.
    if (inFlight.current) { if (force) queued.current = true; return; }
    if (!force && (document.visibilityState === 'hidden' || Date.now() - lastAt.current < MIN_GAP_MS)) return;
    inFlight.current = true;
    lastAt.current = Date.now();
    getUnreadNotificationCount()
      .then(next => { lastKnownCount = next; setCount(next); })
      .catch(() => undefined) // Badge is best-effort; a failed poll keeps the last count.
      .finally(() => {
        inFlight.current = false;
        if (queued.current) { queued.current = false; run(true); }
      });
  }, []);

  useEffect(() => {
    load(true);
    const timer = window.setInterval(() => load(false), POLL_MS);
    const onFocus = () => load(false);
    const onVisibility = () => { if (document.visibilityState === 'visible') load(false); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);
  const value = useMemo(() => ({ count, refresh }), [count, refresh]);
  return <UnreadNotificationsContext.Provider value={value}>{children}</UnreadNotificationsContext.Provider>;
}
