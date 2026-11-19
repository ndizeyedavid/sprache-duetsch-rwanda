import type { WordListEntry } from '../../../lib/services/my-word-list';
import { SayButton } from '../audio/SayButton';

/**
 * One word: listen, the German with its article and plural, the English, then the example in both languages.
 * A word without a recording keeps its row aligned with an empty slot where the speaker would be.
 */
export function WordRow({ word }: { word: WordListEntry }) {
  return (
    <li className="flex items-start gap-3 border-t border-line py-3 first:border-t-0">
      {word.audio ? <SayButton text={word.de.replace(/,.*$/, '')} audio={word.audio} slow /> : <span className="size-7 shrink-0" />}
      <div className="min-w-0 grow">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-semibold" lang="de">{word.de}</span>
          <span className="text-sm text-muted">{word.en}</span>
        </p>
        {word.example ? (
          <p className="mt-1 flex items-start gap-2 text-sm">
            <SayButton text={word.example} audio={word.exampleAudio ?? undefined} />
            <span className="min-w-0">
              <span className="italic" lang="de">{word.example}</span>
              {word.exampleEn ? <span className="block text-xs text-muted">{word.exampleEn}</span> : null}
            </span>
          </p>
        ) : null}
      </div>
    </li>
  );
}
