import type { ReactNode } from 'react';
import { useMemo,useState } from 'react';
import { FiArrowLeft,FiArrowRight,FiBookOpen } from 'react-icons/fi';
import { normalizeText } from '../learn/translate/annotate-html';
import { EnglishLine } from '../learn/translate/EnglishLine';
import { EnglishToggle } from '../learn/translate/EnglishToggle';
import { TranslatedHtml } from '../learn/translate/TranslatedHtml';
import type { LessonTranslation } from '../learn/types';
import { RichTextViewer } from '../ui/RichTextViewer';
import { normalizeBulletLists } from './bullet-lists';
import { repairNumberTable } from './number-table';
import { normalizePracticeReading } from './practice-reading';
import { normalizePracticeText } from './practice-text';
import { normalizeReadingLists } from './reading-lists';
import { normalizeRepeatedTables } from './reading-tables';
import { normalizeTypingTable } from './typing-table';

function sections(html: string) {
  const document = new DOMParser().parseFromString(html, 'text/html');
  const result: { title: string; html: string }[] = [];
  for (const element of Array.from(document.body.children)) {
    if (element.tagName === 'H2') result.push({ title: element.textContent || 'Read', html: '' });
    else {
      if (!result.length) result.push({ title: 'Overview', html: '' });
      result[result.length - 1].html += element.outerHTML;
    }
  }
  return result.filter(section => !/^Übungen(?:\s|$)/i.test(section.title));
}

type Props = { html: string | null; children?: ReactNode; translation?: LessonTranslation | null; level?: string };

/** An HTML lesson read section by section; with a translation, English help and tap-to-translate words. */
export function CourseLessonReader({ html, children, translation, level = '' }: Props) {
  const readingHtml = useMemo(() => {
    const tables = normalizeTypingTable(normalizeRepeatedTables(repairNumberTable(html || '')));
    const practice = normalizePracticeText(normalizePracticeReading(tables));
    return normalizeReadingLists(normalizeBulletLists(practice));
  }, [html]);
  const pages = useMemo(() => sections(readingHtml), [readingHtml]);
  const [active, setActive] = useState(0);
  const view = (pageHtml: string) => translation
    ? <TranslatedHtml html={pageHtml} translation={translation} level={level} className="course-content border-0! p-0!" />
    : <RichTextViewer html={pageHtml} className="course-content border-0! p-0!" />;
  const englishBar = translation ? <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
    <EnglishToggle level={level} /><span className="text-xs text-muted">Tap a German word to see its meaning.</span>
  </div> : null;
  if (pages.length < 2) return <>{englishBar}{view(readingHtml)}{children}</>;
  const page = pages[active] ?? pages[0];
  const titleEn = translation?.lines[normalizeText(page.title)];
  function move(index: number) {
    setActive(index);
    document.getElementById('course-reading')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  return (
    <section id="course-reading" className="scroll-mt-24 space-y-4" aria-label="Lesson sections">
      <div className="flex flex-wrap items-center gap-3 rounded-box bg-base-200 p-3">
        <FiBookOpen className="text-primary" aria-hidden />
        <label htmlFor="course-section" className="text-xs font-semibold">Section {active + 1} / {pages.length}</label>
        <select id="course-section" className="select select-sm min-w-0 flex-1" value={active} onChange={e => move(Number(e.target.value))}>
          {pages.map((p, i) => <option key={i} value={i}>{i + 1}. {p.title}</option>)}
        </select>
        {englishBar}
      </div>
      <progress className="progress progress-primary h-1 w-full" value={active + 1} max={pages.length} aria-label="Reading position" />
      <div>
        <h2 className="text-xl font-bold">{page.title}</h2>
        {titleEn ? <EnglishLine en={titleEn} level={level} /> : null}
      </div>
      {view(page.html)}
      <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
        <button className="btn btn-sm btn-ghost" disabled={active === 0} onClick={() => move(active - 1)}><FiArrowLeft aria-hidden />Back</button>
        {active < pages.length - 1 ? <button className="btn btn-sm btn-primary" onClick={() => move(active + 1)}>Next section<FiArrowRight aria-hidden /></button>
          : <a className="btn btn-sm btn-primary" href="#lesson-practice">Practise<FiArrowRight aria-hidden /></a>}
      </div>
      <div hidden={active < pages.length - 1}>{children}</div>
    </section>
  );
}
