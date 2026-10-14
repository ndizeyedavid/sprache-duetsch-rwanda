import { useState } from 'react';
import { FiCheck,FiUploadCloud } from 'react-icons/fi';
import { apiErrorMessage } from '../../../lib/api';
import type { LessonMaterial } from '../../../lib/services';
import { createMaterial,humanize,updateMaterial,uploadFile } from '../../../lib/services';
import { StudioDialog } from '../StudioDialog';
import { MATERIAL_TYPES } from '../constants';

type Props={lessonId:string;mode:'file'|'link';resource?:LessonMaterial;onClose:()=>void;onSaved:()=>void};
export function ResourceEditor({lessonId,mode,resource,onClose,onSaved}:Props){
  const [draft,setDraft]=useState({title:resource?.title??'',type:resource?.type??(mode==='link'?'LINK':'PDF'),url:resource?.url??'',isDownloadable:resource?.isDownloadable??true});
  const [initial]=useState(JSON.stringify(draft));
  const [metadata,setMetadata]=useState<{mimeType:string;sizeBytes:number}|null>(null);
  const [fileName,setFileName]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState<string|null>(null);
  const close=()=>{if(JSON.stringify(draft)===initial||confirm('Discard resource changes?'))onClose();};
  async function upload(file:File){
    if(file.size>25*1024*1024){setError('Choose a file smaller than 25 MB.');return;}
    setBusy(true);setError(null);
    try{const result=await uploadFile(file);setMetadata({mimeType:result.mimeType,sizeBytes:result.sizeBytes});setFileName(result.originalName);setDraft(previous=>({...previous,title:previous.title||file.name,url:result.url,type:result.mimeType.startsWith('audio/')?'AUDIO':result.mimeType.startsWith('video/')?'VIDEO':result.mimeType==='application/pdf'?'PDF':previous.type}));}
    catch(e){setError(apiErrorMessage(e,'Could not upload file.'));}finally{setBusy(false);}
  }
  return <StudioDialog title={resource?'Edit resource':mode==='file'?'Upload a resource':'Add a link'} onClose={close} busy={busy}>
    <form className="space-y-5" onSubmit={async event=>{
      event.preventDefault();setBusy(true);setError(null);
      try{const payload={...draft,title:draft.title.trim(),...metadata};if(resource)await updateMaterial(resource.id,payload);else await createMaterial(lessonId,payload);onSaved();onClose();}
      catch(e){setError(apiErrorMessage(e,'Could not save resource.'));}finally{setBusy(false);}
    }}>
      <fieldset disabled={busy} className="space-y-5">
        {mode==='file'?<label className="flex cursor-pointer flex-col items-center rounded-box bg-base-200 px-5 py-7 text-center"><span className="mb-3 flex size-12 items-center justify-center rounded-field bg-neutral text-neutral-content">{fileName?<FiCheck size={22} aria-hidden/>:<FiUploadCloud size={22} aria-hidden/>}</span><span className="text-sm font-semibold">{fileName||'Choose a file'}</span><span className="mb-4 mt-1 text-xs text-muted">PDF, audio, video or a worksheet · up to 25 MB</span><input className="file-input file-input-sm w-full max-w-xs" type="file" aria-label="Upload resource file" onChange={event=>{const file=event.target.files?.[0];if(file)void upload(file);}}/></label>:null}
        <label className="block text-sm font-medium">Resource name<input autoFocus={mode==='link'} className="input mt-2 w-full" required maxLength={200} value={draft.title} onChange={event=>setDraft({...draft,title:event.target.value})} placeholder="e.g. Greetings vocabulary sheet"/></label>
        {mode==='link'?<label className="block text-sm font-medium">Web address<input className="input mt-2 w-full" required type="url" value={draft.url} onChange={event=>setDraft({...draft,url:event.target.value})} placeholder="https://…"/></label>:null}
        <div className="flex flex-wrap items-center justify-between gap-4"><label className="text-xs font-medium">Resource type<select className="select select-sm mt-2 w-full" value={draft.type} onChange={event=>setDraft({...draft,type:event.target.value})}>{MATERIAL_TYPES.map(type=><option key={type} value={type}>{humanize(type)}</option>)}</select></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" className="checkbox checkbox-sm" checked={draft.isDownloadable} onChange={event=>setDraft({...draft,isDownloadable:event.target.checked})}/>Allow download</label></div>
      </fieldset>
      {error?<p className="text-sm text-error" role="alert">{error}</p>:null}
      <div className="flex justify-end gap-2"><button type="button" className="btn btn-ghost" disabled={busy} onClick={close}>Cancel</button><button className="btn btn-neutral" disabled={busy||!draft.url}>{busy?'Saving…':'Save resource'}</button></div>
    </form>
  </StudioDialog>;
}
