import { useEffect, useState } from 'react';

const CHECK_EVERY_MS = 60 * 60 * 1000;

/**
 * Registers the service worker and tells an open tab when a newer deploy has taken over,
 * so nobody keeps running stale code. The new worker activates at once (skipWaiting).
 */
export function UpdateNotice() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
    const hadController = !!navigator.serviceWorker.controller;
    const onChange = () => { if (hadController) setReady(true); };
    navigator.serviceWorker.addEventListener('controllerchange', onChange);
    let timer: number | undefined;
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(registration => { timer = window.setInterval(() => { void registration.update(); }, CHECK_EVERY_MS); })
      .catch(() => undefined);
    return () => { navigator.serviceWorker.removeEventListener('controllerchange', onChange); window.clearInterval(timer); };
  }, []);
  if (!ready) return null;
  return (
    <div role="status" className="page-enter fixed inset-x-3 bottom-3 z-[60] mx-auto flex max-w-md items-center gap-3 rounded-box border border-base-300 bg-base-100 p-3 pl-4  sm:inset-x-auto sm:right-4">
      <p className="flex-1 text-sm">A new version of the app is ready.</p>
      <button type="button" className="btn btn-ghost btn-sm rounded-full" onClick={() => setReady(false)}>Later</button>
      <button type="button" className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand hover:text-primary-content" onClick={() => window.location.reload()}>Reload</button>
    </div>
  );
}
