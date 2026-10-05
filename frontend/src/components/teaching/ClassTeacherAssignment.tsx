import { useState } from 'react';
import type { ClassGroupItem } from '../../lib/services';
import type { TeachingTeacher } from '../../lib/teaching';
import { assignClassTeacher } from '../../lib/teaching';
import { apiErrorMessage } from '../../lib/api';
export function ClassTeacherAssignment({ group:g, teachers, onSaved }: { group: ClassGroupItem; teachers: TeachingTeacher[]; onSaved: () => void }) {
  const [id,setId]=useState(g.teacherId??''),[saving,setSaving]=useState(false),[error,setError]=useState<string|null>(null);
  const eligible=teachers.filter(t=>t.status==='ACTIVE'&&t.teachingLevels.some(l=>l.levelId===g.levelId));
  async function save(){setError(null);setSaving(true);try{await assignClassTeacher(g.id,id||null);onSaved();}catch(e){setError(apiErrorMessage(e, 'Could not save. Please try again.'));}finally{setSaving(false);}}
  return <article className="flex flex-wrap items-center justify-between gap-4 border-b border-base-300 p-5 last:border-0"><div><h3 className="text-sm font-semibold">{g.name}</h3><p className="mt-1 text-xs text-base-content/55">{g.level.code} · {g.campus.name} · {g.intake.name}</p><p className="mt-1 text-xs text-base-content/55">{g.isActive?'Active class':'Inactive class'} · {g._count.enrollments} enrolments</p></div><div className="w-full sm:w-auto"><div className="flex flex-wrap items-center gap-2"><select aria-label={`Teacher for ${g.name}`} disabled={saving} value={id} onChange={e=>setId(e.target.value)} className="select select-sm w-full sm:w-60"><option value="">Unassigned</option>{g.teacherId&&!eligible.some(t=>t.id===g.teacherId)?<option value={g.teacherId}>Current teacher (not eligible)</option>:null}{eligible.map(t=><option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}</select><button onClick={()=>void save()} disabled={saving||id===(g.teacherId??'')} className="btn btn-sm">{saving?'Saving…':'Assign teacher'}</button></div>{error?<p role="alert" className="mt-2 max-w-md text-xs text-error">{error}</p>:null}</div></article>;
}
