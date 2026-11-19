import { useState } from 'react';
import { useShowEnglish } from './english';

/** The English meaning under a German line: always shown when "Show English" is on, else one tap away. */
export function EnglishLine({ en, level, className = '' }: { en: string; level: string; className?: string }) {
  const always = useShowEnglish(level);
  const [shown, setShown] = useState(false);
  if (always || shown) return <span className={`block text-[0.8125rem] italic leading-snug text-muted ${className}`}>{en}</span>;
  return <button type="button" onClick={() => setShown(true)} className={`btn btn-ghost btn-xs h-auto min-h-0 px-1.5 py-0.5 text-[0.6875rem] font-semibold text-muted ${className}`} aria-label={`Show English: ${en}`}>EN</button>;
}
