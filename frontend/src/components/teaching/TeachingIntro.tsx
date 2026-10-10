import { FiBookOpen } from 'react-icons/fi';
import { IconTile } from '../ui/IconTile';

/** Compact operational header — this page is a work surface, not a landing page. */
export function TeachingIntro() {
  return (
    <header className="flex items-start gap-3">
      <IconTile icon={FiBookOpen} tone="brand" size="lg" />
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">
          Academic coordination
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-ink sm:text-3xl">
          Teaching assignments
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Approve the levels a teacher may teach, then hand them a class. Only active
          teachers approved for a class&rsquo;s level can be assigned to it.
        </p>
      </div>
    </header>
  );
}