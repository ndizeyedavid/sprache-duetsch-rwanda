import type { ComponentType } from 'react';
import { lazy } from 'react';

const RELOAD_KEY = 'sparch.stale-build-reload';

/** True when the browser asked for a code file that a newer deploy replaced. */
export function isStaleBuildError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /dynamically imported module|Importing a module script failed|Failed to fetch dynamically|Unable to preload CSS|ChunkLoadError/i.test(message);
}

/** Reload once to pick up the new build. Returns false if we already tried recently. */
export function reloadForNewBuild(): boolean {
  const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
  if (Date.now() - last < 30_000) return false;
  sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  window.location.reload();
  return true;
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
