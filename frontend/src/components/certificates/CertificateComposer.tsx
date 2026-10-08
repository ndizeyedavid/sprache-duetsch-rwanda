import { useEffect } from 'react';
import { FiEye, FiAward } from 'react-icons/fi';
import { useApi } from '../../hooks/useApi';
import { listLevels, listStudents } from '../../lib/services';
import type { Certificate } from '../../lib/services';
import { CertificateDesignFields } from './CertificateDesignFields';
import { CertificateEligibility } from './CertificateEligibility';
import { CertificatePdfPanel } from './CertificatePdfPanel';
import { useCertificateDraft } from './useCertificateDraft';

type Props = { initial?: Certificate; onIssued: (certificate: Certificate) => void; onBusyChange: (busy: boolean) => void };
export function CertificateComposer({ initial, onIssued, onBusyChange }: Props) {
  const students = useApi('certificate-students', listStudents);
  const levels = useApi('certificate-levels', listLevels);
  const draft = useCertificateDraft(initial, onIssued);
  useEffect(() => { onBusyChange(!!draft.busy); }, [draft.busy, onBusyChange]);
  const fetchError = students.error ?? levels.error;
  return <div className="space-y-5">
    <p className="max-w-3xl text-sm leading-6 text-base-content/65">Recognise a learner’s completed course. Prepare a school certificate or attach an existing PDF, review the document, then issue it to the student.</p>
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)]">
      <form id="certificate-composer" onSubmit={event => { event.preventDefault(); void draft.showPreview(); }} className="space-y-5">
        <fieldset disabled={!!draft.busy || students.loading || levels.loading} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">Student<select required disabled={!!initial} className="select mt-1.5 w-full" value={draft.studentId} onChange={event => draft.setStudentId(event.target.value)}><option value="">Choose student</option>{(students.data ?? []).map(row => <option key={row.id} value={row.id}>{row.user.firstName} {row.user.lastName} · {row.studentCode}</option>)}</select></label>
            <label className="block text-sm">Completed course<select required disabled={!!initial} className="select mt-1.5 w-full" value={draft.levelId} onChange={event => draft.setLevelId(event.target.value)}><option value="">Choose course</option>{(levels.data ?? []).map(row => <option key={row.id} value={row.id}>{row.code} · {row.title}</option>)}</select></label>
          </div>
          <label className="block text-sm">Certificate format<select className="select mt-1.5 w-full" value={draft.uploaded ? 'uploaded' : 'generated'} onChange={event => draft.setUploaded(event.target.value === 'uploaded')}><option value="generated">School certificate · generated PDF</option><option value="uploaded">Custom certificate · upload PDF</option></select></label>
          {draft.uploaded && <div className="rounded-box bg-base-200 p-4"><label className="block text-sm">Certificate PDF<input type="file" accept="application/pdf,.pdf" className="file-input mt-2 w-full" onChange={event => void draft.upload(event.target.files?.[0])}/></label><p className="mt-2 text-xs text-base-content/60">{draft.file?.name ?? 'Choose the final certificate with the correct student and course details. Up to 25 MB.'}</p></div>}
          <CertificateDesignFields design={draft.design} onChange={draft.setDesign} uploaded={draft.uploaded}/>
        </fieldset>
        {fetchError && <div role="alert" className="alert alert-error alert-soft text-sm">{fetchError}<button type="button" className="btn btn-sm" onClick={() => { students.refetch(); levels.refetch(); }}>Retry</button></div>}
        {draft.error && <p role="alert" className="text-sm text-error">{draft.error}</p>}
        <button type="submit" className="btn w-full" disabled={!!draft.busy || !draft.canPreview || !!fetchError}><FiEye aria-hidden/>{draft.busy === 'preview' ? 'Preparing preview…' : 'Preview & check completion'}</button>
      </form>
      <div className="space-y-4 xl:sticky xl:top-0">
        <CertificatePdfPanel url={draft.current?.url ?? null} loading={draft.busy === 'preview'} onReady={draft.onReady} onError={draft.onPreviewError}/>
        {draft.current && <CertificateEligibility value={draft.current.eligibility}/>}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-box bg-base-200 p-4"><p className="max-w-sm text-xs leading-5 text-base-content/65">Issuing adds this certificate to the student’s profile and creates its public verification record.</p><button type="button" className="btn btn-primary" disabled={!draft.canIssue} onClick={() => void draft.issue()}><FiAward aria-hidden/>{draft.busy === 'issue' ? 'Issuing…' : initial ? 'Issue replacement' : 'Issue certificate'}</button></div>
      </div>
    </div>
  </div>;
}
