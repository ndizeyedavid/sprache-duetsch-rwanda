import { useEffect, useState } from 'react';
import { FiBookOpen, FiCheck, FiEye, FiMoreHorizontal, FiPaperclip, FiSave, FiSend, FiZap } from 'react-icons/fi';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import { getLesson, updateLesson, deleteLesson } from '../../lib/services';
import type { AuthoredLesson } from '../../lib/services';
import { ErrorBlock, LoadingBlock } from '../common/PageState';
import { CourseLessonReader } from '../student/CourseLessonReader';
import { PreparationResources } from './PreparationResources';
import { PreparationPractice } from './PreparationPractice';
import { PreparationPreview } from './PreparationPreview';
import { StudioDialog } from './StudioDialog';
import { LessonContentFields } from './studio/LessonContentFields';
import { LessonSettings } from './studio/LessonSettings';
import { formatNames, toLessonDraft } from './studio/lesson-draft';
import type { ChangeLesson } from './studio/lesson-draft';
import './studio/studio.css';

type Props = { id: string; moduleTitle: string; modulePublished: boolean; onSaved: () => void; onDirty: (value: boolean) => void; onDeleted: () => void };
export function PreparationLesson(props: Props) {
  const lesson = useApi(`prepare-lesson-${props.id}`, () => getLesson(props.id));
  if (lesson.loading) return <LoadingBlock label="Opening lesson…"/>;
  if (lesson.error || !lesson.data) return <ErrorBlock message={lesson.error ?? 'Lesson unavailable.'} onRetry={lesson.refetch}/>;
  return <LessonWorkspace {...props} data={lesson.data} refresh={lesson.refetch}/>;
}
function LessonWorkspace({ data, refresh, ...props }: Props & { data: AuthoredLesson; refresh: () => void }) {
  const [draft, setDraft] = useState(() => toLessonDraft(data));
  const [initial, setInitial] = useState(() => JSON.stringify(toLessonDraft(data)));
  const [tab, setTab] = useState('Content'), [preview, setPreview] = useState(false), [settings, setSettings] = useState(false);
  const [busy, setBusy] = useState(false), [error, setError] = useState<string | null>(null), [saved, setSaved] = useState(false);
  const dirty = JSON.stringify(draft) !== initial;
  const { onDirty } = props;
  useEffect(() => { onDirty(dirty); return () => onDirty(false); }, [dirty, onDirty]);
  useEffect(() => {
    if (!dirty && !busy) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, busy]);
  const change: ChangeLesson = (field, value) => { setDraft(previous => ({ ...previous, [field]: value })); setSaved(false); };
  async function save(published = draft.isPublished) {
    if (draft.title.trim().length < 2) { setError('Give your lesson a name with at least two characters.'); return; }
    const next = { ...draft, title: draft.title.trim(), isPublished: published };
    setBusy(true); setError(null);
    try {
      await updateLesson(props.id, { ...next, description: next.description || null, body: next.body || null, videoUrl: next.videoUrl || null, audioUrl: next.audioUrl || null, estimatedMinutes: next.estimatedMinutes ? Number(next.estimatedMinutes) : undefined });
      setDraft(next); setInitial(JSON.stringify(next)); setSaved(true); props.onSaved(); setSettings(false);
    } catch (e) { setError(apiErrorMessage(e, 'Could not save lesson.')); } finally { setBusy(false); }
  }
  async function remove() {
    if (!confirm(`Delete “${draft.title}” and its resources? This cannot be undone.`)) return;
    setBusy(true); setError(null);
    try { await deleteLesson(props.id); props.onDeleted(); } catch (e) { setError(apiErrorMessage(e, 'Could not delete lesson.')); setSettings(false); setBusy(false); }
  }
  const tabs = [{ name: 'Content', Icon: FiBookOpen }, { name: 'Resources', Icon: FiPaperclip, count: data.materials.length }, { name: 'Practice', Icon: FiZap, count: data.activities.length }];
  return <section className="card studio-lesson bg-base-100">
    <div className="px-5 pt-6 sm:px-7">
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-base-content/50">{props.moduleTitle}</p>
        <div className="flex items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs ${draft.isPublished ? 'bg-success/15' : 'bg-base-200 text-base-content/60'}`}>{draft.isPublished ? 'Published' : 'Draft'}</span><button className="btn btn-sm btn-circle btn-ghost" aria-label="Lesson settings" onClick={() => setSettings(true)} disabled={busy}><FiMoreHorizontal size={20} aria-hidden/></button></div></div>
      <h2 className="mt-3 text-xl font-semibold leading-8 sm:text-2xl">{draft.title || 'Untitled lesson'}</h2>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-base-content/60">{formatNames[draft.contentType]}{draft.estimatedMinutes ? ` · ${draft.estimatedMinutes} min` : ''}</p>
        <button className="btn btn-sm btn-ghost" onClick={() => setPreview(true)}><FiEye aria-hidden/>Student preview</button></div>
      <div role="tablist" aria-label="Lesson editor" className="tabs tabs-box mt-5 grid grid-cols-3 bg-base-200/70 p-1.5">
        {tabs.map(({ name, Icon, count }) => <button key={name} type="button" role="tab" aria-selected={tab === name} aria-controls={`studio-${name}`} id={`studio-tab-${name}`} className={`tab gap-2 rounded-field text-xs sm:text-sm ${tab === name ? 'tab-active bg-base-100 font-semibold' : ''}`} onClick={() => setTab(name)}><Icon aria-hidden/><span>{name}</span>{count ? <span className="hidden text-xs opacity-50 sm:inline">{count}</span> : null}</button>)}
      </div>
    </div>
    <fieldset disabled={busy} className="min-w-0 px-5 py-6 sm:px-7">
      <div role="tabpanel" id="studio-Content" aria-labelledby="studio-tab-Content" hidden={tab !== 'Content'}><LessonContentFields draft={draft} change={change}/></div>
      <div role="tabpanel" id="studio-Resources" aria-labelledby="studio-tab-Resources" hidden={tab !== 'Resources'}><PreparationResources lesson={data} onSaved={refresh}/></div>
      <div role="tabpanel" id="studio-Practice" aria-labelledby="studio-tab-Practice" hidden={tab !== 'Practice'}><PreparationPractice lesson={data} onSaved={refresh}/></div>
    </fieldset>
    <footer className="sticky bottom-3 z-10 mx-4 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-box bg-base-200 px-4 py-3 sm:mx-6">
      <div className="text-xs text-base-content/60" role="status">{error ? <span className="text-error" role="alert">{error}</span> : busy ? 'Saving…' : dirty ? 'Unsaved changes' : <span className="flex items-center gap-1.5"><FiCheck aria-hidden/>{saved ? 'Changes saved' : 'All changes saved'}</span>}</div>
      <div className="flex gap-2"><button className="btn btn-sm border-0 bg-base-100" disabled={busy || !dirty} onClick={() => void save()}><FiSave aria-hidden/>Save{draft.isPublished ? '' : ' draft'}</button>
        {!draft.isPublished ? <button className="btn btn-sm btn-primary" disabled={busy || draft.title.trim().length < 2} onClick={() => void save(true)}><FiSend aria-hidden/>Publish</button> : null}</div>
      {!props.modulePublished && draft.isPublished ? <p className="w-full text-xs text-base-content/60">Publish the module to make this lesson available to students.</p> : null}
    </footer>
    {settings ? <LessonSettings draft={draft} change={change} busy={busy} onClose={() => setSettings(false)} onDelete={() => void remove()} onUnpublish={() => void save(false)}/> : null}
    {preview ? <StudioDialog title="Student preview" wide onClose={() => setPreview(false)}><PreparationPreview draft={draft} lesson={data}><CourseLessonReader key={draft.body} html={draft.body}/></PreparationPreview></StudioDialog> : null}
  </section>;
}
