import { normalizeText } from './annotate-html';
import { EnglishLine } from './EnglishLine';
import { useShowEnglish } from './english';
import { GermanText } from './GermanText';
import { useLessonEnglish } from './lesson-english';

/** Activity text of an HTML lesson: tappable German words and the English line, when the lesson has a translation. */
export function TranslatedText({ text }: { text: string }) {
  const english = useLessonEnglish();
  if (!english) return <>{text}</>;
  const en = english.lines[normalizeText(text)];
  return <><GermanText text={text} />{en ? <EnglishLine en={en} level={english.level} /> : null}</>;
}

/** Text revealed after answering (explanation, model answer) with the English stored next to it. */
export function RevealedText({ de, en }: { de: string; en?: string | null }) {
  const english = useLessonEnglish();
  return <>{de}{en && english ? <EnglishLine en={en} level={english.level} /> : null}</>;
}

/** Just the English of a text, while "Show English" is on (for places that cannot hold buttons, like a flip card). */
export function EnglishOf({ text }: { text: string }) {
  const english = useLessonEnglish();
  const on = useShowEnglish(english?.level ?? '');
  const en = english?.lines[normalizeText(text)];
  return en && on ? <span className="block text-xs italic text-muted" lang="en">{en}</span> : null;
}
