import { SayButton } from '../audio/SayButton';
import { EnglishLine } from '../translate/EnglishLine';
import { GermanText } from '../translate/GermanText';
import type { LessonContent } from '../types';
import { PlayAllBar } from './PlayAllBar';
import { usePlayAll } from './usePlayAll';

/** A short reading text: tap any word, listen sentence by sentence or to the whole text. */
export function ReadingSection({ content }: { content: LessonContent }) {
  const reading = content.reading;
  const lines = reading?.paragraphs.flat() ?? [];
  const player = usePlayAll(lines);
  if (!reading) return null;
  const offsets = reading.paragraphs.map((_, number) => reading.paragraphs.slice(0, number).reduce((sum, paragraph) => sum + paragraph.length, 0));
  return <div className="space-y-4">
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div><h3 className="text-lg font-bold" lang="de">{reading.title}</h3><p className="text-sm text-muted">{reading.titleEn}</p></div>
      <PlayAllBar playing={player.playing} onPlay={(slow) => void player.playAll(slow)} onStop={player.stop} label="Listen to the text" />
    </header>
    <div className="space-y-4 rounded-box border border-line bg-base-100 p-4 text-base leading-relaxed">
      {reading.paragraphs.map((paragraph, number) => <div key={number} className="space-y-1">
        <p>{paragraph.map((line, position) => <span key={position} className={`rounded-sm transition-colors ${player.current === offsets[number] + position ? 'bg-brand-soft' : ''}`}><GermanText text={line.de} />{' '}</span>)}</p>
        <EnglishLine en={paragraph.map((line) => line.en).join(' ')} level={content.level} />
      </div>)}
    </div>
    <details className="text-sm">
      <summary className="cursor-pointer text-xs font-semibold text-muted">Listen sentence by sentence</summary>
      <ul className="mt-2 space-y-2">{lines.map((line, number) => <li key={number} className="flex items-start gap-2"><SayButton text={line.de} audio={line.audio} slow /><span lang="de" className="pt-0.5">{line.de}</span></li>)}</ul>
    </details>
  </div>;
}
