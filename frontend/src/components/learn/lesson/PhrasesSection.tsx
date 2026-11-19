import { Say } from '../translate/Say';
import type { LessonContent } from '../types';

/** Ready-made sentences grouped by what you want to say. */
export function PhrasesSection({ content }: { content: LessonContent }) {
  return <div className="grid gap-4 md:grid-cols-2">
    {content.phrases.map((group) => <section key={group.function} className="rounded-box border border-line p-4">
      <h3 className="font-bold" lang="de">{group.function}</h3>
      <p className="text-xs text-muted">{group.functionEn}</p>
      <ul className="mt-3 space-y-3 text-sm">{group.items.map((item) => <li key={item.de}><Say line={item} level={content.level} /></li>)}</ul>
    </section>)}
  </div>;
}
