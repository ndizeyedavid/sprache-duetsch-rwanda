import { SayButton } from '../audio/SayButton';
import { EnglishLine } from '../translate/EnglishLine';
import { GermanText } from '../translate/GermanText';
import type { LessonContent } from '../types';
import { PlayAllBar } from './PlayAllBar';
import { usePlayAll } from './usePlayAll';

/** The lesson conversation as chat bubbles; "Play" reads it out with a voice per speaker. */
export function DialogueSection({ content }: { content: LessonContent }) {
  const dialogue = content.dialogue;
  const player = usePlayAll(dialogue?.lines ?? []);
  if (!dialogue) return null;
  const first = dialogue.lines[0]?.speaker;
  return <div className="space-y-4">
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div><h3 className="text-lg font-bold" lang="de">{dialogue.title}</h3><p className="text-sm text-muted">{dialogue.titleEn}</p></div>
      <PlayAllBar playing={player.playing} onPlay={(slow) => void player.playAll(slow)} onStop={player.stop} label="Play dialogue" />
    </header>
    <ol className="space-y-3">
      {dialogue.lines.map((line, index) => {
        const mine = line.speaker !== first;
        return <li key={index} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[34rem] rounded-box border p-3 text-sm transition-colors ${player.current === index ? 'border-primary bg-brand-soft' : mine ? 'border-line bg-base-200' : 'border-line bg-base-100'}`}>
            <p className="mb-1 text-xs font-bold text-primary">{line.speaker}</p>
            <div className="flex items-start gap-2">
              <SayButton text={line.de} audio={line.audio} slow />
              <span className="min-w-0 pt-0.5"><GermanText text={line.de} /><EnglishLine en={line.en} level={content.level} className="mt-0.5" /></span>
            </div>
          </div>
        </li>;
      })}
    </ol>
  </div>;
}
