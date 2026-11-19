import { useEffect,useMemo,useRef,useState } from 'react';
import { RichTextViewer } from '../../ui/RichTextViewer';
import type { Entry,LessonTranslation } from '../types';
import { annotateHtml } from './annotate-html';
import { useShowEnglish } from './english';
import { lookup } from './tokens';
import { WordPopover } from './WordPopover';

type Props = { html: string; translation: LessonTranslation; level: string; className?: string };
type Open = { key: string; entry: Entry | undefined; anchor: DOMRect };

/**
 * An HTML lesson page with English help: English under each block while "Show English" is on, and
 * any German word with a meaning opens it on tap (same popover as course v2 lessons).
 */
export function TranslatedHtml({ html, translation, level, className }: Props) {
  const showEnglish = useShowEnglish(level);
  const annotated = useMemo(() => annotateHtml(html, translation.lines, translation.glossary), [html, translation]);
  const [open, setOpen] = useState<Open | null>(null);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    // One listener for every word span the annotated HTML holds.
    const tap = (event: MouseEvent) => {
      const word = (event.target as HTMLElement | null)?.closest<HTMLElement>('.gw');
      if (!word) return;
      const key = word.dataset.gw ?? word.textContent ?? '';
      setOpen({ key, entry: lookup(translation.glossary, key), anchor: word.getBoundingClientRect() });
    };
    element.addEventListener('click', tap);
    return () => element.removeEventListener('click', tap);
  }, [translation]);
  return <div ref={root} className={showEnglish ? 'show-en' : ''}>
    <RichTextViewer html={annotated} className={className} />
    {open ? <WordPopover word={open.key} entry={open.entry} anchor={open.anchor} onClose={() => setOpen(null)} /> : null}
  </div>;
}
