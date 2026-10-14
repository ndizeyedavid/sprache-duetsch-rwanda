import { useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import { updateSession } from '../../lib/services';
export function SessionLifecycle({session,onSaved}:{session:{id:string;status:string;startAt:string;endAt:string};onSaved:()=>void}) {
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  const started=Date.parse(session.startAt)<=Date.now(), ended=Date.parse(session.endAt)<=Date.now(), closed=['COMPLETED','CANCELLED'].includes(session.status);
  async function change(status:string) {if(status==='COMPLETED'&&!confirm('Mark this class completed?'))return;setBusy(true);setError('');try{await updateSession(session.id,{status});onSaved();}catch(e){setError(apiErrorMessage(e,'Could not change class status.'));}finally{setBusy(false);} }
  if(closed)return null;
  return <div className="space-y-2">{started&&!ended&&session.status!=='LIVE'?<button disabled={busy} className="btn btn-success btn-sm" onClick={()=>void change('LIVE')}>Start class</button>:null}{started?<button disabled={busy} className="btn btn-neutral btn-sm ml-2" onClick={()=>void change('COMPLETED')}>Mark completed</button>:<p className="text-xs text-muted">Class can be started at its scheduled time.</p>}{error?<p className="text-xs text-error" role="alert">{error}</p>:null}</div>;
}
