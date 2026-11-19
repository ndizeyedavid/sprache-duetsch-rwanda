import { Say } from '../translate/Say';
import type { LessonContent } from '../types';

/** Pronunciation focus: the rule and examples to listen to and repeat. */
export function SoundsSection({ content }: { content: LessonContent }) {
  const sounds = content.pronunciation;
  if (!sounds) return null;
  return <div className="space-y-4">
    <header>
      <h3 className="text-lg font-bold" lang="de">{sounds.focus}</h3>
      <p className="text-sm text-muted">{sounds.focusEn}</p>
    </header>
    <p className="text-sm leading-relaxed" lang="de">{sounds.explanation}</p>
    <p className="rounded-box bg-brand-tint p-3 text-sm leading-relaxed"><span className="font-semibold">In English: </span>{sounds.explanationEn}</p>
    <p className="text-xs font-semibold text-muted">Listen, then say each one aloud.</p>
    <ul className="space-y-3 text-base">{sounds.examples.map((example) => <li key={example.de}><Say line={example} level={content.level} strong /></li>)}</ul>
  </div>;
}
