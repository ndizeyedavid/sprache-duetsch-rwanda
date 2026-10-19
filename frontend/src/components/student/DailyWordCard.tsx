import { FiBookmark } from 'react-icons/fi';
import { wordOfTheDay } from './word-of-the-day';

/** A tiny daily vocabulary card: one German word, its meaning and an example sentence. */
export function DailyWordCard() {
  const word = wordOfTheDay();
  return (
    <div className="mx-4 mt-3 rounded-box border border-line bg-base-100 p-3" lang="de">
      <p className="flex items-center gap-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted">
        <FiBookmark aria-hidden className="text-primary" />Wort des Tages
      </p>
      <p className="mt-1.5 text-base font-semibold">{word.de}</p>
      <p className="text-xs text-muted" lang="en">{word.en}</p>
      <p className="mt-1.5 text-xs italic">„{word.example}“</p>
    </div>
  );
}
