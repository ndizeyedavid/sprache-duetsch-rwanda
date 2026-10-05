import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { format } from 'date-fns';
import { FiX } from 'react-icons/fi';
import { apiErrorMessage } from '../../lib/api';
import { createSession, updateSession } from '../../lib/services';
import { MODE_OPTIONS, PROVIDER_OPTIONS } from './constants';
import { RepeatField } from './RepeatField';
type Editing = { id:string; title:string; classGroupId:string; startAt:string; endAt:string; mode:string; provider:string|null; meetingUrl:string|null; room:string|null; notes:string|null; recordingUrl?:string|null; status?:string };
type Props = { open:boolean; onClose:()=>void; classes:{id:string;name:string;code:string}[]; editing?:Editing|null; initialDate?:string|null; onSaved:()=>void };
export function SessionEditorModal({open,onClose,classes,editing,initialDate,onSaved}:Props) {
  const [classId,setClass]=useState(''),[title,setTitle]=useState(''),[date,setDate]=useState(''),[start,setStart]=useState('09:00'),[end,setEnd]=useState('10:30');
  const [mode,setMode]=useState('ONLINE'),[provider,setProvider]=useState('GOOGLE_MEET'),[link,setLink]=useState(''),[room,setRoom]=useState(''),[notes,setNotes]=useState(''),[recording,setRecording]=useState('');
  const [repeat,setRepeat]=useState(false),[weeks,setWeeks]=useState(4),[saving,setSaving]=useState(false),[error,setError]=useState('');
  const locked=Boolean(editing && (['COMPLETED','CANCELLED'].includes(editing.status??'') || Date.parse(editing.endAt)<Date.now()));
  useEffect(()=>{if(!open)return;setError('');setClass(editing?.classGroupId??classes[0]?.id??'');setTitle(editing?.title??'');setDate(editing?format(new Date(editing.startAt),'yyyy-MM-dd'):initialDate??'');setStart(editing?format(new Date(editing.startAt),'HH:mm'):'09:00');setEnd(editing?format(new Date(editing.endAt),'HH:mm'):'10:30');setMode(editing?.mode??'ONLINE');setProvider(editing?.provider??'GOOGLE_MEET');setLink(editing?.meetingUrl??'');setRoom(editing?.room??'');setNotes(editing?.notes??'');setRecording(editing?.recordingUrl??'');setRepeat(false);setWeeks(4);},[open,editing,classes,initialDate]);
  if(!open)return null;
  async function submit(e:FormEvent) {
    e.preventDefault();setError('');setSaving(true);
    try {
      const metadata={notes:notes.trim(),recordingUrl:recording.trim()||null};
      if(locked&&editing) await updateSession(editing.id,metadata);
      else {
        const startAt=new Date(`${date}T${start}:00`).toISOString(),endAt=new Date(`${date}T${end}:00`).toISOString();
        if(startAt>=endAt)throw Error('End must be after start.');
        const payload={...metadata,title:title.trim(),startAt,endAt,mode,provider,meetingUrl:link.trim()||null,room:room.trim(),timezone:Intl.DateTimeFormat().resolvedOptions().timeZone};
        if(editing) {
          const changed=Date.parse(startAt)!==Date.parse(editing.startAt)||Date.parse(endAt)!==Date.parse(editing.endAt);
          await updateSession(editing.id,{...payload,...(!changed?{startAt:undefined,endAt:undefined}:{})});
        } else await createSession({...payload,classGroupId:classId,repeatWeeks:repeat?weeks:1});
      }
      onSaved();onClose();
    }catch(e){setError(apiErrorMessage(e,e instanceof Error?e.message:'Could not save session.'));}finally{setSaving(false);}
  }
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><button aria-label="Close editor" onClick={()=>{if(!saving)onClose();}} className="absolute inset-0 bg-neutral/40 backdrop-blur-sm" /><form onSubmit={submit} className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-box bg-base-100">
    <div className="flex items-start justify-between p-5"><div><h2 className="text-lg font-semibold">{editing?'Edit class':'New live class'}</h2><p className="mt-1 text-xs text-base-content/60">{locked?'Scheduling details are locked. Add notes or a recording below.':`Times in ${Intl.DateTimeFormat().resolvedOptions().timeZone}. Students are notified of schedule changes.`}</p></div><button type="button" disabled={saving} onClick={onClose} className="btn btn-ghost btn-sm btn-circle" aria-label="Close"><FiX /></button></div>
    <div className="space-y-4 overflow-y-auto px-5 pb-5"><fieldset disabled={locked||saving} className="space-y-4">
      <label className="block text-xs font-medium">Class<select aria-label="Class" required disabled={Boolean(editing)} className="select mt-2 w-full" value={classId} onChange={e=>setClass(e.target.value)}><option value="">Choose class</option>{classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label className="block text-xs font-medium">Title<input className="input mt-2 w-full" value={title} onChange={e=>setTitle(e.target.value)} /></label>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><label className="col-span-2 text-xs sm:col-span-1">Date<input required type="date" min={locked?undefined:format(new Date(),'yyyy-MM-dd')} className="input mt-2 w-full" value={date} onChange={e=>setDate(e.target.value)} /></label><label className="text-xs">Start<input required type="time" className="input mt-2 w-full" value={start} onChange={e=>setStart(e.target.value)} /></label><label className="text-xs">End<input required type="time" className="input mt-2 w-full" value={end} onChange={e=>setEnd(e.target.value)} /></label></div>
      <RepeatField enabled={repeat} onEnabled={setRepeat} count={weeks} onCount={setWeeks} date={date} startTime={start} endTime={end} disabled={Boolean(editing)} />
      <div className="grid grid-cols-3 gap-2">{MODE_OPTIONS.map(o=><button type="button" key={o.value} aria-pressed={mode===o.value} onClick={()=>setMode(o.value)} className={`btn btn-sm ${mode===o.value?'btn-neutral':'btn-ghost'}`}>{o.label}</button>)}</div>
      {mode!=='ONSITE'?<><label className="block text-xs">Provider<select className="select mt-2 w-full" value={provider} onChange={e=>setProvider(e.target.value)}>{PROVIDER_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></label><label className="block text-xs">Meeting link<input required type="url" className="input mt-2 w-full" placeholder="https://meet.google.com/…" value={link} onChange={e=>setLink(e.target.value)} /></label></>:null}
      {mode!=='ONLINE'?<label className="block text-xs">Room<input className="input mt-2 w-full" value={room} onChange={e=>setRoom(e.target.value)} /></label>:null}
    </fieldset><label className="block text-xs">Notes<textarea disabled={saving} className="textarea mt-2 w-full" rows={3} value={notes} onChange={e=>setNotes(e.target.value)} /></label><label className="block text-xs">Recording link<input disabled={saving} type="url" className="input mt-2 w-full" placeholder="https://…" value={recording} onChange={e=>setRecording(e.target.value)} /></label>{error?<p role="alert" className="alert alert-error text-xs">{error}</p>:null}</div>
    <div className="flex justify-end gap-2 bg-base-200/40 p-4"><button type="button" disabled={saving} className="btn btn-sm" onClick={onClose}>Cancel</button><button disabled={saving} className="btn btn-primary btn-sm">{saving?'Saving…':editing?'Save changes':repeat?`Schedule ${weeks} classes`:'Schedule class'}</button></div>
  </form></div>;
}
