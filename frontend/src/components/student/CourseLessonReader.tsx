import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { FiArrowLeft, FiArrowRight, FiBookOpen } from 'react-icons/fi';
import { RichTextViewer } from '../ui/RichTextViewer';
import { normalizeRepeatedTables } from './reading-tables';
import { normalizeReadingLists } from './reading-lists';
import { normalizeTypingTable } from './typing-table';
import { normalizeBulletLists } from './bullet-lists';
import { repairNumberTable } from './number-table';
import { normalizePracticeReading } from './practice-reading';
import { normalizePracticeText } from './practice-text';

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

export function CourseLessonReader({ html, children }: { html: string | null; children?: ReactNode }) {
  const readingHtml = useMemo(() => {
    const tables = normalizeTypingTable(normalizeRepeatedTables(repairNumberTable(html || '')));
    const practice = normalizePracticeText(normalizePracticeReading(tables));
    return normalizeReadingLists(normalizeBulletLists(practice));
  }, [html]);
  const pages = useMemo(() => sections(readingHtml), [readingHtml]);
  const [active, setActive] = useState(0);
  if (pages.length < 2) return <><RichTextViewer html={readingHtml} className="course-content border-0! p-0!" />{children}</>;
  const page = pages[active] ?? pages[0];
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
      </div>
      <progress className="progress progress-primary h-1 w-full" value={active + 1} max={pages.length} aria-label="Reading position" />
      <h2 className="text-xl font-bold">{page.title}</h2>
      <RichTextViewer html={page.html} className="course-content border-0! p-0!" />
      <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
        <button className="btn btn-sm btn-ghost" disabled={active === 0} onClick={() => move(active - 1)}><FiArrowLeft aria-hidden />Back</button>
        {active < pages.length - 1 ? <button className="btn btn-sm btn-primary" onClick={() => move(active + 1)}>Next section<FiArrowRight aria-hidden /></button>
          : <a className="btn btn-sm btn-primary" href="#lesson-practice">Practise<FiArrowRight aria-hidden /></a>}
      </div>
      <div hidden={active < pages.length - 1}>{children}</div>
    </section>
  );
}
