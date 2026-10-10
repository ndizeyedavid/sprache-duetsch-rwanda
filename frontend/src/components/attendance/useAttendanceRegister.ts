import { useEffect,useMemo,useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import { getTeacherSchedule } from '../../lib/schedule-api';
import { getSessionRoster,markSessionAttendance } from '../../lib/services';
import { useScheduleClock } from "../schedule/useScheduleClock";
export function useAttendanceRegister() {
  useScheduleClock();
  const [params,setParams]=useSearchParams(),id=params.get('session');
  const sessions=useApi('attendance-sessions',getTeacherSchedule);
  const roster=useApi(`attendance-roster-${id}`,()=>getSessionRoster(id??''),!!id);
  const [drafts,setDrafts]=useState<Record<string,Record<string,{status:string;note:string|null;expectedUpdatedAt:string|null}>>>({});
  const [saving,setSaving]=useState(false),[error,setError]=useState<string|null>(null),[saved,setSaved]=useState(false);
  const draft=useMemo(()=>id?drafts[id]??{}:{},[drafts,id]);
  const rows=useMemo(()=>roster.stale?[]:roster.data??[],[roster.data,roster.stale]);
  const selected=sessions.data?.find(s=>s.id===id)??null;
  const editable=!!selected&&selected.status!=='CANCELLED'&&new Date(selected.startAt)<=new Date()&&!saving&&!roster.stale&&!roster.loading;
  const marks=Object.fromEntries(Object.entries(draft).map(([key,value])=>[key,value.status]));
  useEffect(()=>{setError(null);setSaved(false);},[id]);
  useEffect(()=>{if(!Object.keys(draft).length)return;const warn=(e:BeforeUnloadEvent)=>{e.preventDefault();};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[draft]);
  function pick(next:string){if(saving)return;const p=new URLSearchParams(params);p.set('session',next);setParams(p);}
  function change(studentId:string,status:string,note?:string|null){if(!id||!editable)return;setSaved(false);setDrafts(prev=>{const old=prev[id]??{},row=rows.find(r=>r.studentId===studentId);return {...prev,[id]:{...old,[studentId]:{status,expectedUpdatedAt:old[studentId]?old[studentId].expectedUpdatedAt:row?.updatedAt??null,note:note===undefined?old[studentId]?.note??row?.note??null:note}}};});}
  function discard(){if(id)setDrafts(p=>({...p,[id]:{}}));setError(null);setSaved(false);}
  async function save(){if(!id||!editable||!Object.keys(draft).length)return;setSaving(true);setError(null);try{await markSessionAttendance(id,Object.entries(draft).map(([studentId,v])=>({studentId,...v})));setDrafts(p=>({...p,[id]:{}}));setSaved(true);roster.refetch();}catch(e){setError(apiErrorMessage(e, 'Could not save. Please try again.'));}finally{setSaving(false);}}
  return { sessions,roster,rows,selected,id,draft,marks,editable,saving,error,saved,pick,change,discard,save };
}
