import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NProgress from 'nprogress';

NProgress.configure({ showSpinner: false, trickleSpeed: 160, minimum: 0.15 });

/**
 * Thin top progress bar on every client-side navigation.
 * Mount once inside the router; it starts on pathname change and
 * completes on the next paint so lazy pages still show feedback.
 */
export function RouteProgress() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    NProgress.start();
    const done = requestAnimationFrame(() => {
      // Second frame lets the Suspense fallback paint first on lazy routes.
      requestAnimationFrame(() => NProgress.done());
    });
    return () => {
      cancelAnimationFrame(done);
      NProgress.done();
    };
  }, [pathname, search]);

  return null;
}
