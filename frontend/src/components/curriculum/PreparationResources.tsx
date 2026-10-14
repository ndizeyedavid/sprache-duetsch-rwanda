import { useState } from 'react';
import { FiEdit2,FiFileText,FiHeadphones,FiLink,FiTrash2,FiUploadCloud,FiVideo } from 'react-icons/fi';
import { apiErrorMessage } from '../../lib/api';
import type { AuthoredLesson,LessonMaterial } from '../../lib/services';
import { deleteMaterial,humanize } from '../../lib/services';
import { ResourceEditor } from './studio/ResourceEditor';

export function PreparationResources({lesson,onSaved}:{lesson:AuthoredLesson;onSaved:()=>void}){
  const [editor,setEditor]=useState<{mode:'file'|'link';resource?:LessonMaterial}|null>(null);
  const [busy,setBusy]=useState(false),[error,setError]=useState<string|null>(null);
  async function remove(resource:LessonMaterial){
    if(!confirm(`Remove “${resource.title}” from this lesson?`))return;
    setBusy(true);setError(null);
    try{await deleteMaterial(resource.id);onSaved();}catch(e){setError(apiErrorMessage(e,'Could not remove resource.'));}finally{setBusy(false);}
  }
  return <div className="space-y-5">
    <div><h3 className="text-lg font-semibold">Give students something to keep</h3><p className="mt-1 text-xs text-muted">Notes, recordings and useful links for this lesson.</p></div>
    <div className="grid gap-3 sm:grid-cols-2">
      <button className="flex items-center gap-3 rounded-box bg-neutral p-5 text-left text-neutral-content" onClick={()=>setEditor({mode:'file'})}><FiUploadCloud size={24} aria-hidden/><span><span className="block text-sm font-semibold">Upload a file</span><span className="mt-1 block text-xs opacity-60">PDF, audio, video & more</span></span></button>
      <button className="flex items-center gap-3 rounded-box bg-base-200 p-5 text-left" onClick={()=>setEditor({mode:'link'})}><FiLink size={24} aria-hidden/><span><span className="block text-sm font-semibold">Add a link</span><span className="mt-1 block text-xs text-muted">A useful page or resource</span></span></button>
    </div>
    {error?<p role="alert" className="text-sm text-error">{error}</p>:null}
    <div className="space-y-2">{lesson.materials.map(resource=>{
      const Icon=resource.type==='AUDIO'?FiHeadphones:resource.type==='VIDEO'?FiVideo:resource.type==='LINK'?FiLink:FiFileText;
      return <article key={resource.id} className="flex items-center gap-3 rounded-box bg-base-200 p-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-field bg-base-100"><Icon size={20} aria-hidden/></span>
        <div className="min-w-0 grow"><h4 className="break-words text-sm font-medium">{resource.title}</h4><p className="mt-1 text-xs text-muted">{humanize(resource.type)}{resource.sizeBytes?` · ${(resource.sizeBytes/1024/1024).toFixed(1)} MB`:''}{resource.isDownloadable?' · Downloadable':''}</p></div>
        <button className="btn btn-sm btn-square btn-ghost" aria-label={`Edit ${resource.title}`} onClick={()=>setEditor({mode:resource.type==='LINK'?'link':'file',resource})}><FiEdit2 aria-hidden/></button><button className="btn btn-sm btn-square btn-ghost text-muted" disabled={busy} aria-label={`Remove ${resource.title}`} onClick={()=>void remove(resource)}><FiTrash2 aria-hidden/></button>
      </article>;
    })}</div>
    {!lesson.materials.length?<p className="py-6 text-center text-sm text-muted">Your lesson resources will appear here.</p>:null}
    {editor?<ResourceEditor lessonId={lesson.id} {...editor} onClose={()=>setEditor(null)} onSaved={onSaved}/>:null}
  </div>;
}
