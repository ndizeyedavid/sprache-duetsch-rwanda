import { useState } from 'react';
import { FiArrowLeft,FiCheck,FiCloud,FiSend } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { apiErrorMessage } from '../../../lib/api';
import { uploadHomeworkFile } from '../../../lib/homework';
import { AttachmentList } from './AttachmentList';
import { AudioRecorder } from './AudioRecorder';
import { HomeworkGuide } from './HomeworkGuide';
import { HomeworkQuestions } from './HomeworkQuestions';
import { SubmissionHistory } from './SubmissionHistory';
import { dateLabel,statusLabels } from './format';
import type { HomeworkDetail } from './types';
import { useHomeworkDraft } from './useHomeworkDraft';
export function HomeworkWorkspace({ data, refetch }: { data: HomeworkDetail; refetch: () => void }) {
  const a = data.assignment, s = data.submission;
  const draft = useHomeworkDraft(data, refetch);
  const [files, setFiles] = useState(data.files), [uploading, setUploading] = useState(false), [uploadError, setUploadError] = useState(''), [confirming, setConfirming] = useState(false), [recording, setRecording] = useState(false);
  const questions = a.questions ?? [];
  const unanswered = questions.filter(q => { const v = draft.work.responses[q.question.id]; return v == null || typeof v === 'string' && !v.trim() || Array.isArray(v) && !v.length || typeof v === 'object' && !Object.keys(v).length; }).length;
  const late = !!a.dueAt && new Date(a.dueAt) < new Date();
  const blocked = late && !a.allowLate;
  const editable = draft.editable && !blocked;
  const disabled = draft.busy || uploading || recording;
  async function attach(file: File) {
    setUploadError('');
    if (draft.work.fileIds.length >= 5) { setUploadError('Attach up to 5 files. Remove a file first.'); return; }
    if (file.size > 10 * 1024 * 1024) { setUploadError('Choose a file smaller than 10 MB.'); return; }
    setUploading(true);
    try { const uploaded = await uploadHomeworkFile(a.id, file); setFiles(prev => [...prev, uploaded]); draft.setWork(prev => ({ ...prev, fileIds: [...prev.fileIds, uploaded.id] })); }
    catch (e) { setUploadError(apiErrorMessage(e, 'Upload failed. Try again.')); }
    finally { setUploading(false); }
  }
  return <div className="journey-enter space-y-5"><Link to="/assignments" className="inline-flex items-center gap-2 text-xs text-base-content/60 hover:text-primary"><FiArrowLeft />All assignments</Link>
    <section className="card overflow-hidden border border-base-300/70 bg-base-100"><div className="flex items-center gap-5 p-6 sm:p-8"><div className="min-w-0 flex-1"><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-primary">{a.classGroup.level.code} · {a.classGroup.name} · Homework</p><h1 className="mt-3 text-2xl font-bold sm:text-3xl">{a.title}</h1><p className="mt-3 text-xs text-base-content/60">Shared by {a.createdBy.firstName} {a.createdBy.lastName} · {dateLabel(a.dueAt, true)}</p></div><img src="/illustrations/course-learner.webp" alt="" className="hidden size-28 object-contain sm:block" /></div><ol className="steps w-full border-t border-base-300/60 p-4 text-[11px]"><li className="step step-primary">Read & prepare</li><li className={`step ${s ? 'step-primary' : ''}`}>Save your work</li><li className={`step ${(s?.revision ?? 0) > 0 ? 'step-primary' : ''}`}>Submit</li><li className={`step ${s?.feedback ? 'step-primary' : ''}`}>Use feedback</li></ol></section>
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]"><div className="min-w-0 space-y-5">
      <section className="card border border-base-300/70 bg-base-100 p-5 sm:p-7"><h2 className="mb-4 text-base font-semibold">Your task</h2><p className="whitespace-pre-wrap text-sm leading-8 text-base-content/75">{a.instructions}</p></section>
      {s?.feedback ? <section className={`card border p-5 sm:p-7 ${s.status === 'RETURNED' ? 'border-warning/30 bg-warning/5' : 'border-success/20 bg-success/5'}`}><p className="text-[10px] font-semibold uppercase tracking-wider">{s.status === 'RETURNED' ? 'A chance to improve' : 'Your teacher’s feedback'}</p><div className="mt-2 flex justify-between gap-4"><h2 className="text-base font-semibold">{statusLabels[s.status]}</h2>{s.score !== null ? <span className="font-bold">{s.score}/{a.maxPoints}</span> : null}</div><p className="mt-3 whitespace-pre-wrap text-sm leading-7">{s.feedback}</p></section> : null}
      <section className="card border border-base-300/70 bg-base-100 p-5 sm:p-7"><div className="mb-4 flex flex-wrap justify-between gap-2"><h2 className="text-base font-semibold">{editable ? 'Your workspace' : 'Your submitted work'}</h2><span role="status" className="flex items-center gap-2 text-xs text-base-content/55"><FiCloud />{editable ? draft.state : statusLabels[s?.status ?? 'NOT_STARTED']}</span></div>
        {draft.recovery ? <div className="mb-4 rounded-box border border-warning/30 bg-warning/5 p-4"><p className="text-xs font-semibold">An unsynced device copy is available</p><p className="mt-2 text-xs leading-6 text-base-content/65">The server draft has changed since this device last synced. Keep the current draft, or replace it with the device copy.</p><details className="my-3 text-xs"><summary className="cursor-pointer">Read device copy</summary><p className="mt-2 whitespace-pre-wrap leading-6">{draft.recovery.text || 'Attachments only'}</p></details><div className="flex flex-wrap gap-2"><button className="btn btn-xs" onClick={draft.restore}>Use device copy</button><button className="btn btn-ghost btn-xs" onClick={draft.discardRecovery}>Keep server draft</button></div></div> : null}
        {blocked ? <p className="alert alert-warning alert-soft mb-4 text-xs">The deadline has passed. Your saved work remains here; contact your teacher to reopen submissions.</p> : null}
        {editable && late ? <p className="mb-4 text-xs text-warning">Late work is accepted and will be marked as late.</p> : null}
        {questions.length ? <><p className="mb-4 text-xs text-base-content/60">{questions.length - unanswered} of {questions.length} answered · Untimed · Your answers save as you work.</p><HomeworkQuestions questions={questions} responses={draft.work.responses} disabled={!editable || draft.busy} onChange={(id, value) => { setConfirming(false); draft.setWork(p => ({ ...p, responses: { ...p.responses, [id]: value } })); }} /></> : null}
        {!questions.length && (a.responseType === 'TEXT' || a.responseType === 'MIXED' || !editable && draft.work.text) ? <label className="block"><span className="mb-2 block text-xs font-medium">Written response</span><textarea className="textarea min-h-64 w-full rounded-box text-sm leading-8" aria-label="Written response" value={draft.work.text} onChange={e => { const text = e.target.value; setConfirming(false); draft.setWork(p => ({ ...p, text })); }} disabled={!editable || draft.busy} maxLength={30000} placeholder="Start with what you know. Your draft saves as you write…" /><span className="mt-2 block text-right text-[10px] text-base-content/45">{draft.work.text.length.toLocaleString()} / 30,000</span></label> : null}
        <AttachmentList assignmentId={a.id} files={files.filter(f => draft.work.fileIds.includes(f.id))} disabled={disabled} onRemove={editable ? id => draft.setWork(p => ({ ...p, fileIds: p.fileIds.filter(f => f !== id) })) : undefined} />
        {editable && !questions.length && a.responseType !== 'TEXT' ? <div className="mt-4 space-y-4">{a.responseType === 'AUDIO' ? <AudioRecorder onRecordingChange={setRecording} onFile={attach} disabled={disabled} /> : null}<label className="block rounded-box border border-dashed border-base-300 p-4"><span className="mb-2 block text-xs font-semibold">{uploading ? 'Uploading…' : 'Attach your work'}</span><input type="file" aria-label="Attach your work" className="file-input file-input-sm w-full" disabled={disabled} accept={a.responseType === 'AUDIO' ? 'audio/*' : '.pdf,.png,.jpg,.jpeg,.webp,audio/*'} onChange={e => { const f = e.target.files?.[0]; if (f) void attach(f); e.target.value = ''; }} /><span className="mt-2 block text-[10px] text-base-content/55">Up to 5 files · 10 MB each · {a.responseType === 'AUDIO' ? 'MP3, WAV, WebM, Ogg or M4A' : 'PDF, images or audio'}</span></label></div> : null}
        {uploadError || draft.error ? <div role="alert" className="alert alert-error alert-soft mt-4 text-xs">{uploadError || draft.error}</div> : null}
        {editable ? <div className="mt-6 border-t border-base-300/60 pt-4">{confirming ? <div className="mb-4 rounded-box bg-base-200/70 p-4"><p className="text-sm font-semibold">Ready to send to your teacher?</p><p className="mt-2 text-xs leading-6 text-base-content/65">Check your response and attachments. Once submitted, you can edit again if your teacher requests a revision. This is submission {(s?.revision ?? 0) + 1} of {a.maxSubmissions}.</p></div> : null}<div className="flex flex-wrap justify-between gap-3"><button className="btn btn-sm rounded-full" disabled={disabled} onClick={() => void draft.save().catch(() => {})}><FiCheck />Save draft</button><button className="btn btn-primary btn-sm rounded-full" disabled={disabled || (questions.length ? unanswered > 0 : !draft.work.text.trim() && !draft.work.fileIds.length)} onClick={() => confirming ? void draft.submit() : setConfirming(true)}><FiSend />{draft.busy ? 'Submitting…' : confirming ? 'Confirm submission' : 'Review & submit'}</button></div>{confirming ? <button className="btn btn-ghost btn-xs mt-2" onClick={() => setConfirming(false)}>Keep working</button> : null}</div> : <p className="mt-5 text-xs leading-6 text-base-content/60">{s?.submittedAt ? `Received ${dateLabel(s.submittedAt, true)}. ` : ''}{s?.status === 'SUBMITTED' ? 'Your teacher will review your work. You’ll receive a notification when feedback is ready.' : s?.status === 'GRADED' ? 'Your grade and feedback are saved. Read them before your next task.' : 'Contact your teacher if you need another submission.'}</p>}
      </section><SubmissionHistory questions={questions} submission={s} files={files} assignmentId={a.id} />
    </div><HomeworkGuide assignment={a} /></div>
  </div>;
}
