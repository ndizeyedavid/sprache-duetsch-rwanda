import { FiArrowLeft } from 'react-icons/fi';

export const MAIN_SITE_URL = 'https://deutshsprache.org';

/** Way back to the school's public website from the sign-in pages. */
export function BackToSite() {
  return (
    <a href={MAIN_SITE_URL}
      className="btn btn-primary mb-8 gap-2 rounded-full">
      <FiArrowLeft aria-hidden />
      Return to homepage
    </a>
  );
}
