import { useState } from 'react';
import { FiArrowRight,FiBookOpen,FiEdit2,FiPlus,FiTrash2 } from 'react-icons/fi';
import { apiErrorMessage } from '../../lib/api';
import type { AuthoredLesson,LessonActivity } from '../../lib/services';
import { deleteActivity } from '../../lib/services';
import { StudioDialog } from './StudioDialog';
import { PracticeEditor } from './studio/PracticeEditor';
import { activityConfig,practiceKinds } from './studio/practice-draft';

export function PreparationPractice({ lesson, onSaved }: { lesson: AuthoredLesson; onSaved: () => void }) {
  const [picking,setPicking]=useState(false),[editor,setEditor]=useState<{type:string;activity?:LessonActivity}|null>(null);
  const [busy,setBusy]=useState(false),[error,setError]=useState<string|null>(null);
  async function remove(activity: LessonActivity) {
    if(!confirm(`Delete “${activity.title}”?`))return;
    setBusy(true);setError(null);
    try{await deleteActivity(activity.id);onSaved();}catch(e){setError(apiErrorMessage(e,'Could not remove activity.'));}finally{setBusy(false);}
  }
  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-semibold">Put learning into practice</h3><p className="mt-1 text-xs text-muted">Small activities that help the lesson stick.</p></div><button className="btn btn-sm btn-neutral" onClick={()=>setPicking(true)}><FiPlus aria-hidden/>Add activity</button></div>
    {error?<p role="alert" className="text-sm text-error">{error}</p>:null}
    <div className="grid gap-3 xl:grid-cols-2">
      {lesson.activities.map((activity,index)=>{
        const type=activityConfig(activity).isDocumentSubmission?'DOCUMENT':activity.type;
        const kind=practiceKinds.find(item=>item.type===type),Icon=kind?.Icon??FiBookOpen;
        return <article key={activity.id} className="rounded-box bg-base-200 p-5">
          <div className="flex items-center justify-between gap-3"><span className={`flex size-11 items-center justify-center rounded-field ${kind?.color??'bg-neutral text-neutral-content'}`}><Icon size={20} aria-hidden/></span><span className="text-xs text-muted">{activity.isPublished?'Published':'Draft'}</span></div>
          <p className="mt-4 text-[11px] text-muted">{String(index+1).padStart(2,'0')} · {kind?.label??activity.type.toLowerCase().replaceAll('_',' ')}</p><h4 className="mt-1 text-sm font-semibold leading-6">{activity.title}</h4>
          {activity.instructions?<p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">{activity.instructions}</p>:null}
          <div className="mt-4 flex items-center justify-between"><button className="btn btn-sm btn-ghost -ml-2" onClick={()=>setEditor({type,activity})}><FiEdit2 aria-hidden/>Edit activity<FiArrowRight aria-hidden/></button><button className="btn btn-sm btn-square btn-ghost text-muted" aria-label={`Delete ${activity.title}`} disabled={busy} onClick={()=>void remove(activity)}><FiTrash2 aria-hidden/></button></div>
        </article>;
      })}
      {!lesson.activities.length?<div className="col-span-full rounded-box bg-base-200 px-6 py-10 text-center"><span className="mx-auto flex size-14 items-center justify-center rounded-box bg-warning text-warning-content"><FiBookOpen size={24} aria-hidden/></span><h4 className="mt-4 text-base font-semibold">A little practice goes a long way</h4><p className="mt-2 text-sm text-muted">Add a question, a matching game, or a writing task.</p></div>:null}
    </div>
    {picking?<StudioDialog title="What would you like to add?" onClose={()=>setPicking(false)}><div className="grid gap-3 sm:grid-cols-2">{practiceKinds.map(kind=><button key={kind.type} className="flex items-start gap-3 rounded-box bg-base-200 p-4 text-left transition hover:bg-base-300" onClick={()=>{setPicking(false);setEditor({type:kind.type});}}><span className={`flex size-10 shrink-0 items-center justify-center rounded-field ${kind.color}`}><kind.Icon size={18} aria-hidden/></span><span><span className="block text-sm font-semibold">{kind.label}</span><span className="mt-1 block text-xs leading-5 text-muted">{kind.hint}</span></span></button>)}</div></StudioDialog>:null}
    {editor?<PracticeEditor lessonId={lesson.id} {...editor} onClose={()=>setEditor(null)} onSaved={onSaved}/>:null}
  </div>;
}
