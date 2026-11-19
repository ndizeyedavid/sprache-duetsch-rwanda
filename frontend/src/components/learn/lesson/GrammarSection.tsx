import { FiInfo } from 'react-icons/fi';
import { Say } from '../translate/Say';
import type { LessonContent } from '../types';

/** Grammar topics: the rule in German and English, a table, and examples with audio. */
export function GrammarSection({ content }: { content: LessonContent }) {
  return <div className="space-y-6">
    {content.grammar.map((topic) => <article key={topic.title} className="space-y-3">
      <header>
        <h3 className="text-lg font-bold leading-snug" lang="de">{topic.title}</h3>
        <p className="text-sm text-muted">{topic.titleEn}</p>
      </header>
      <p className="text-sm leading-relaxed" lang="de">{topic.explanation}</p>
      <p className="rounded-box bg-brand-tint p-3 text-sm leading-relaxed"><span className="font-semibold">In English: </span>{topic.explanationEn}</p>
      {topic.table ? <div className="overflow-x-auto rounded-box border border-line">
        <table className="table table-sm">
          <thead><tr>{topic.table.head.map((cell, index) => <th key={index} scope="col" className="bg-base-200 text-ink">{cell}</th>)}</tr></thead>
          <tbody lang="de">{topic.table.rows.map((row, index) => <tr key={index}>{row.map((cell, column) => <td key={column} className={column === 1 && topic.table!.head.length > 2 ? 'font-semibold text-primary' : ''}>{cell}</td>)}</tr>)}</tbody>
        </table>
      </div> : null}
      {topic.examples.length ? <ul className="space-y-3">
        {topic.examples.map((example) => <li key={example.de} className="text-sm">
          <Say line={example} level={content.level} />
          {example.noteEn || example.note ? <p className="ml-9 mt-1 text-xs text-muted">{example.noteEn ?? example.note}</p> : null}
        </li>)}
      </ul> : null}
      {topic.tip ? <p className="flex gap-2 rounded-box border border-line p-3 text-sm"><FiInfo aria-hidden className="mt-0.5 shrink-0 text-primary" />
        <span><span lang="de">{topic.tip}</span>{topic.tipEn ? <span className="mt-1 block text-muted">{topic.tipEn}</span> : null}</span></p> : null}
    </article>)}
  </div>;
}
