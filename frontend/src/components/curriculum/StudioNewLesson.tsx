import { useState } from 'react';
import { FiBookOpen,FiHeadphones,FiVideo } from 'react-icons/fi';
import { apiErrorMessage } from '../../lib/api';
import { createLesson } from '../../lib/services';
import { StudioDialog } from './StudioDialog';

export function StudioNewLesson({ moduleId, onClose, onCreated }: { moduleId: string; onClose: () => void; onCreated: (id: string) => void }) {
  const [title, setTitle] = useState(''), [type, setType] = useState('TEXT');
  const [busy, setBusy] = useState(false), [error, setError] = useState<string | null>(null);
  const close = () => { if (!title || confirm('Discard this new lesson?')) onClose(); };
  return <StudioDialog title="New lesson" onClose={close} busy={busy}>
    <form className="space-y-5" onSubmit={async event => {
      event.preventDefault(); setBusy(true); setError(null);
      try { const lesson = await createLesson(moduleId, { title: title.trim(), contentType: type, isPublished: false }); onCreated(lesson.id); onClose(); }
      catch (e) { setError(apiErrorMessage(e, 'Could not create lesson.')); } finally { setBusy(false); }
    }}>
      <label className="block text-sm font-medium">Lesson name<input autoFocus required minLength={2} maxLength={200} className="input mt-2 w-full" value={title} onChange={event => setTitle(event.target.value)} placeholder="e.g. Introducing yourself"/></label>
      <fieldset><legend className="mb-2 text-sm font-medium">Start with</legend><div className="grid grid-cols-3 gap-3">
        {[{type:'TEXT',label:'Reading',Icon:FiBookOpen},{type:'VIDEO',label:'Video',Icon:FiVideo},{type:'AUDIO',label:'Listening',Icon:FiHeadphones}].map(item => <button type="button" key={item.type} aria-pressed={type === item.type} onClick={() => setType(item.type)} className={`flex flex-col items-center gap-3 rounded-box p-5 text-sm ${type === item.type ? 'bg-neutral text-neutral-content' : 'bg-base-200'}`}><item.Icon size={22} aria-hidden/>{item.label}</button>)}
      </div></fieldset>
      <p className="text-xs text-base-content/60">Your lesson stays a draft until you publish it.</p>
      {error ? <p role="alert" className="text-sm text-error">{error}</p> : null}
      <div className="flex justify-end gap-2"><button type="button" className="btn btn-ghost" disabled={busy} onClick={close}>Cancel</button><button className="btn btn-neutral" disabled={busy}>{busy ? 'Creating…' : 'Create lesson'}</button></div>
    </form>
  </StudioDialog>;
}
