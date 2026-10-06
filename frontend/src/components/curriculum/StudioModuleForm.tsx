import { useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import type { ModuleItem } from '../../lib/services';
import { createModule,updateModule } from '../../lib/services';
import { StudioDialog } from './StudioDialog';

export function StudioModuleForm({ levelId, module, onClose, onSaved }: { levelId: string; module?: ModuleItem; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(module?.title ?? '');
  const [published, setPublished] = useState(module?.isPublished ?? false);
  const [busy, setBusy] = useState(false), [error, setError] = useState<string | null>(null);
  const dirty = title !== (module?.title ?? '') || published !== (module?.isPublished ?? false);
  const close = () => { if (!dirty || confirm('Discard module changes?')) onClose(); };
  return <StudioDialog title={module ? 'Edit module' : 'New module'} onClose={close} busy={busy}>
    <form className="space-y-5" onSubmit={async event => {
      event.preventDefault(); setBusy(true); setError(null);
      try { const data = { title: title.trim(), isPublished: published }; if (module) await updateModule(module.id, data); else await createModule(levelId, data); onSaved(); onClose(); }
      catch (e) { setError(apiErrorMessage(e, 'Could not save module.')); } finally { setBusy(false); }
    }}>
      <label className="block text-sm font-medium">Module name<input className="input mt-2 w-full" autoFocus required minLength={2} maxLength={200} value={title} onChange={event => setTitle(event.target.value)} placeholder="e.g. Everyday conversations"/></label>
      <label className="flex items-center gap-3 rounded-box bg-base-200 p-4 text-sm"><input type="checkbox" className="checkbox checkbox-sm" checked={published} onChange={event => setPublished(event.target.checked)}/>Published to students</label>
      {error ? <p className="text-sm text-error" role="alert">{error}</p> : null}
      <div className="flex justify-end gap-2"><button type="button" className="btn btn-ghost" disabled={busy} onClick={close}>Cancel</button><button className="btn btn-neutral" disabled={busy}>{busy ? 'Saving…' : module ? 'Save module' : 'Create module'}</button></div>
    </form>
  </StudioDialog>;
}
