import { useState } from 'react';
import { FiChevronDown,FiLayout,FiMusic,FiVideo } from 'react-icons/fi';
import { StudioNotesEditor } from './StudioNotesEditor';
import type { ChangeLesson,LessonDraft } from './lesson-draft';
import { lessonStructure } from './lesson-draft';

export function LessonContentFields({ draft, change }: { draft: LessonDraft; change: ChangeLesson }) {
  const [summary, setSummary] = useState(!!draft.description);
  return <div className="space-y-6">
    <label className="block text-xs font-medium text-muted">LESSON TITLE
      <input aria-label="Lesson title" className="input mt-2 w-full border-0 bg-base-200 text-lg font-semibold" required minLength={2} maxLength={200} value={draft.title} onChange={event => change('title', event.target.value)}/>
    </label>
    <div><button className="flex items-center gap-2 text-sm text-muted" type="button" aria-expanded={summary} onClick={() => setSummary(!summary)}><FiChevronDown className={summary ? 'rotate-180' : ''} aria-hidden/>{summary ? 'Introduction' : 'Add a short introduction'}</button>
      {summary ? <textarea className="textarea mt-3 w-full border-0 bg-base-200" rows={2} maxLength={3000} aria-label="Lesson introduction" placeholder="What will students learn?" value={draft.description} onChange={event => change('description', event.target.value)}/> : null}</div>
    <div className="studio-notes">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-semibold">Lesson notes</h3>
        {!draft.body.replace(/<[^>]*>/g, '').trim() ? <button type="button" className="btn btn-sm btn-ghost" onClick={() => change('body', lessonStructure)}><FiLayout aria-hidden/>Use a starter</button> : null}</div>
      <StudioNotesEditor value={draft.body} onChange={html => change('body', html)}/>
    </div>
    <details className="rounded-box bg-base-200 p-4" open={draft.contentType === 'VIDEO' || draft.contentType === 'AUDIO' || undefined}>
      <summary className="cursor-pointer text-sm font-medium">Audio & video <span className="ml-1 text-xs font-normal text-muted">optional</span></summary>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{(['videoUrl', 'audioUrl'] as const).map(field => <label key={field} className="text-xs font-medium"><span className="mb-2 flex items-center gap-2">{field === 'videoUrl' ? <FiVideo aria-hidden/> : <FiMusic aria-hidden/>}{field === 'videoUrl' ? 'Video link' : 'Audio link'}</span><input className="input w-full border-0" type="url" value={draft[field]} onChange={event => change(field, event.target.value)} placeholder="https://…"/></label>)}</div>
    </details>
  </div>;
}
