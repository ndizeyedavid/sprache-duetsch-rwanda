import type { ComponentType } from 'react';
import { lazy } from 'react';

const RELOAD_KEY = 'sparch.stale-build-reload';
const RESET_KEY = 'sparch.stale-build-reset';

/** True when the browser asked for a code file that a newer deploy replaced. */
export function isStaleBuildError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /dynamically imported module|Importing a module script failed|Failed to fetch dynamically|Unable to preload CSS|ChunkLoadError/i.test(message);
}

function triedWithin(key: string, ms: number): boolean {
  return Date.now() - Number(sessionStorage.getItem(key) ?? 0) < ms;
}

/** Drops the service worker and its caches so the next load comes straight from the server. */
async function clearOfflineCache(): Promise<void> {
  const registrations = (await navigator.serviceWorker?.getRegistrations()) ?? [];
  await Promise.all(registrations.map((registration) => registration.unregister()));
  if ('caches' in window) await Promise.all((await caches.keys()).map((key) => caches.delete(key)));
}

/**
 * Quietly picks up a new deploy: a plain reload first, then a reload with the offline cache cleared.
 * Returns false only when both were already tried in the last minute (usually: no connection).
 */
export function reloadForNewBuild(): boolean {
  if (!triedWithin(RELOAD_KEY, 30_000)) {
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    window.location.reload();
    return true;
  }
  if (!triedWithin(RESET_KEY, 60_000)) {
    sessionStorage.setItem(RESET_KEY, String(Date.now()));
    void clearOfflineCache().catch(() => undefined).finally(() => window.location.reload());
    return true;
  }
  return false;
}

/** `React.lazy` for named page exports that survives deploys instead of showing a blank page. */
export function lazyPage<P extends object = object>(load: () => Promise<ComponentType<P>>) {
  return lazy<ComponentType<P>>(async () => {
    try {
      return { default: await load() };
    } catch (error) {
      if (isStaleBuildError(error) && reloadForNewBuild()) return new Promise<never>(() => {});
      throw error;
    }
  });
}
