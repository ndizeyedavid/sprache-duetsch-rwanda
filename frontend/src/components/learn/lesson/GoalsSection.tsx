import { FiAward,FiTarget } from 'react-icons/fi';
import { EnglishLine } from '../translate/EnglishLine';
import { GermanText } from '../translate/GermanText';
import type { LessonContent } from '../types';

/** What the lesson is about and what the student can do afterwards. */
export function GoalsSection({ content }: { content: LessonContent }) {
  return <div className="space-y-4">
    {content.photo ? <img src={content.photo.src} alt={content.photo.alt} width={800} height={533} loading="lazy" decoding="async" className="aspect-[3/2] w-full max-w-xl rounded-box object-cover" /> : null}
    <div>
      <p className="text-base font-semibold"><GermanText text={content.summary} /></p>
      <p className="mt-1 text-sm text-muted">{content.summaryEn}</p>
    </div>
    <div className="rounded-box border border-line p-4">
      <h3 className="flex items-center gap-2 text-sm font-bold"><FiTarget aria-hidden className="text-primary" />Nach dieser Lektion können Sie … <span className="font-normal text-muted">· After this lesson you can …</span></h3>
      <ul className="mt-3 space-y-2">
        {content.goals.map((goal) => <li key={goal.de} className="flex gap-2 text-sm"><span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
          <span><GermanText text={goal.de} /><EnglishLine en={goal.en} level={content.level} /></span></li>)}
      </ul>
    </div>
    {content.exam ? <p className="flex items-start gap-2 rounded-box bg-base-200 p-3 text-xs"><FiAward aria-hidden className="mt-0.5 shrink-0 text-primary" /><span><span className="font-semibold">Exam practice:</span> {content.exam}</span></p> : null}
  </div>;
}
