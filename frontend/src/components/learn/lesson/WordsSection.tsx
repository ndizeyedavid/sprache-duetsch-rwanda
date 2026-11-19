import { Link } from 'react-router-dom';
import { FiCopy } from 'react-icons/fi';
import { SayButton } from '../audio/SayButton';
import { EnglishLine } from '../translate/EnglishLine';
import { GermanText } from '../translate/GermanText';
import type { LessonContent } from '../types';

/** The lesson's words: listen, read the meaning and an example, then open the flashcards. */
export function WordsSection({ content, flashcardsHref }: { content: LessonContent; flashcardsHref?: string }) {
  return <div className="space-y-4">
    <ul className="grid gap-3 md:grid-cols-2">
      {content.vocab.map((word) => <li key={word.de} className="rounded-box border border-line bg-base-100 p-3">
        <div className="flex items-center gap-2">
          <SayButton text={word.de} audio={word.audio} slow size="md" />
          <div className="min-w-0">
            <p className="font-bold leading-tight" lang="de">{word.de}</p>
            <p className="text-sm leading-snug text-muted">{word.en}</p>
          </div>
        </div>
        <div className="mt-2 flex items-start gap-2 border-t border-line pt-2 text-sm">
          <SayButton text={word.example} audio={word.exampleAudio} />
          <span className="min-w-0"><GermanText text={word.example} /><EnglishLine en={word.exampleEn} level={content.level} /></span>
        </div>
        {word.noteEn ? <p className="mt-2 text-xs text-muted">{word.noteEn}</p> : null}
      </li>)}
    </ul>
    {flashcardsHref ? <Link to={flashcardsHref} className="btn btn-sm rounded-full border-line bg-base-100"><FiCopy aria-hidden />Practise with flashcards</Link> : null}
  </div>;
}
