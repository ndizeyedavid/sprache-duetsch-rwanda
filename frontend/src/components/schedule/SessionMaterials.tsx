import { useState } from 'react';
import { FiArrowUpRight,FiTrash2 } from 'react-icons/fi';
import { apiDelete,apiErrorMessage,apiPost } from '../../lib/api';
export type SessionMaterial = { id:string; title:string; type:string; url:string|null; description:string|null };
export function SessionMaterials({id,materials,manage=false,onSaved}:{id:string;materials:SessionMaterial[];manage?:boolean;onSaved?:()=>void}) {
  const [title,setTitle]=useState(''),[url,setUrl]=useState(''),[type,setType]=useState('LINK'),[description,setDescription]=useState('');
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  async function save() {
    setBusy(true);setError('');
    try { await apiPost(`/sessions/${id}/materials`,{title,type,url:url||null,description:description||undefined});setTitle('');setUrl('');setDescription('');onSaved?.(); }
    catch(e){setError(apiErrorMessage(e,'Could not add material.'));}finally{setBusy(false);}
  }
  async function remove(materialId:string) {
    if(!confirm('Remove this class material?'))return;
    setBusy(true);setError('');
    try{await apiDelete(`/sessions/materials/${materialId}`);onSaved?.();}catch(e){setError(apiErrorMessage(e,'Could not remove material.'));}finally{setBusy(false);}
  }
  return <section className="space-y-3 rounded-box bg-base-200 p-4">
    <h3 className="text-sm font-semibold">Class materials</h3>
    {materials.length ? materials.map(m => <div key={m.id} className="rounded-box bg-base-100 p-3">
      <div className="flex items-start justify-between gap-2">
        <div><p className="text-[10px] text-muted">{m.type}</p>
          {m.url ? <a href={m.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-secondary">{m.title}<FiArrowUpRight /></a> : <p className="text-sm font-semibold">{m.title}</p>}
        </div>
        {manage ? <button type="button" disabled={busy} aria-label={`Remove ${m.title}`} className="btn btn-ghost btn-xs btn-circle" onClick={()=>void remove(m.id)}><FiTrash2 /></button> : null}
      </div>
      {m.description ? <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-muted">{m.description}</p> : null}
    </div>) : <p className="text-xs text-muted">No materials added yet.</p>}
    {manage ? <div className="space-y-2">
      <label className="block text-xs">Material title<input className="input input-sm mt-1 w-full" value={title} onChange={e=>setTitle(e.target.value)} /></label>
      <select aria-label="Material type" className="select select-sm w-full" value={type} onChange={e=>setType(e.target.value)}>{['LINK','PDF','NOTE','AUDIO','VIDEO','WORKSHEET','SLIDE'].map(t=><option key={t}>{t}</option>)}</select>
      <label className="block text-xs">Link (optional for notes)<input type="url" className="input input-sm mt-1 w-full" value={url} onChange={e=>setUrl(e.target.value)} /></label>
      <label className="block text-xs">Description or note<textarea className="textarea mt-1 w-full" value={description} onChange={e=>setDescription(e.target.value)} /></label>
      <button disabled={busy||!title.trim()} className="btn btn-neutral btn-sm" onClick={()=>void save()}>{busy?'Saving…':'Add material'}</button>
    </div> : null}
    {error ? <p role="alert" className="text-xs text-error">{error}</p> : null}
  </section>;
}
