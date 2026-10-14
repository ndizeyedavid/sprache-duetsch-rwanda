import { lazyPage } from '../lib/lazy-page';

// Public admissions pages load on demand so the sign-in bundle stays small on slow networks.
export const PublicApply = lazyPage(() => import("../pages/public/Apply").then((module) => module.Apply));
