import { FiArrowLeft } from 'react-icons/fi';

export const MAIN_SITE_URL = 'https://deutshsprache.org';

/** Way back to the school's public website from the sign-in pages. */
export function BackToSite() {
  return (
    <a href={MAIN_SITE_URL}
      className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-brand">
      <FiArrowLeft aria-hidden />
      Back to deutshsprache.org
    </a>
  );
}
