import { SayButton } from '../audio/SayButton';
import type { Line } from '../types';
import { EnglishLine } from './EnglishLine';
import { GermanText } from './GermanText';

/** One German line with its speaker button, tappable words and English meaning. */
export function Say({ line, level, slow = true, strong = false }: { line: Line; level: string; slow?: boolean; strong?: boolean }) {
  return <span className="flex items-start gap-2">
    <SayButton text={line.de} audio={line.audio} slow={slow} />
    <span className="min-w-0 grow pt-0.5">
      <GermanText text={line.de} className={strong ? 'font-semibold' : ''} />
      <EnglishLine en={line.en} level={level} className="mt-0.5" />
    </span>
  </span>;
}
