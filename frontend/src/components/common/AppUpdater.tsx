import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const CHECK_EVERY_MS = 60 * 60 * 1000;

/**
 * Registers the service worker and applies new deploys without interrupting anyone:
 * once a newer version has taken over, the next page change loads it with a full reload.
 */
export function AppUpdater() {
  const { pathname } = useLocation();
  const updateReady = useRef(false);

  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
    const hadController = !!navigator.serviceWorker.controller;
    const onChange = () => { if (hadController) updateReady.current = true; };
    navigator.serviceWorker.addEventListener('controllerchange', onChange);
    let timer: number | undefined;
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(registration => { timer = window.setInterval(() => { void registration.update(); }, CHECK_EVERY_MS); })
      .catch(() => undefined);
    return () => { navigator.serviceWorker.removeEventListener('controllerchange', onChange); window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    if (updateReady.current) window.location.reload();
  }, [pathname]);

  return null;
}
