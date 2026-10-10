import { useCallback, useEffect, useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import { createCertificate, previewCertificate } from '../../lib/certificates-api';
import { useSession } from '../../lib/session';
import type { Certificate, CertificateEligibility } from '../../lib/services';
import { checkCertificateEligibility, uploadFile } from '../../lib/services';
import { defaultCertificateDesign } from './certificate-types';
import type { CertificateDraft } from './certificate-types';

export function useCertificateDraft(initial: Certificate | undefined, onIssued: (certificate: Certificate) => void) {
  const { user } = useSession();
  const [studentId, setStudentId] = useState(initial?.student?.id ?? '');
  const [levelId, setLevelId] = useState(initial?.level.id ?? '');
  const [uploaded, setUploaded] = useState(!!initial?.pdfUrl);
  const [design, setDesign] = useState(() => initial?.metadata?.document?.design ?? defaultCertificateDesign(user ? `${user.firstName} ${user.lastName}` : 'Academic Administration'));
  const [file, setFile] = useState<{ url: string; name: string } | null>(initial?.pdfUrl ? { url: initial.pdfUrl, name: 'Previously uploaded certificate.pdf' } : null);
  const [busy, setBusy] = useState<'preview' | 'issue' | 'upload' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ url: string; key: string; eligibility: CertificateEligibility } | null>(null);
  const [reviewed, setReviewed] = useState<string | null>(null);
  const body: CertificateDraft = { studentId, levelId, design: { ...design, grade: design.grade?.trim() || undefined }, ...(uploaded && file ? { pdfUrl: file.url } : {}), ...(initial ? { replacesCertificateId: initial.id } : {}) };
  const key = JSON.stringify(body);
  const current = preview?.key === key ? preview : null;
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview.url); }, [preview]);
  const onReady = useCallback(() => setReviewed(key), [key]);
  const onPreviewError = useCallback(() => setReviewed(null), []);
  async function upload(selected: File | undefined) {
    if (!selected) return;
    setError(null);
    if (selected.type !== 'application/pdf' || selected.size > 25 * 1024 * 1024) { setError('Choose a PDF certificate up to 25 MB.'); return; }
    setBusy('upload'); setFile(null); setPreview(null);
    try { const result = await uploadFile(selected); setFile({ url: result.url, name: selected.name }); }
    catch (e) { setError(apiErrorMessage(e, 'Could not upload the certificate.')); }
    finally { setBusy(null); }
  }
  async function showPreview() {
    setBusy('preview'); setError(null); setReviewed(null); setPreview(null);
    try {
      const [eligibility, pdf] = await Promise.all([checkCertificateEligibility(studentId, levelId), previewCertificate(body)]);
      setPreview({ url: URL.createObjectURL(pdf), key, eligibility });
    } catch (e) { setError(apiErrorMessage(e, 'Could not prepare the certificate preview.')); }
    finally { setBusy(null); }
  }
  async function issue() {
    if (!current?.eligibility.eligible || reviewed !== key || busy) return;
    setBusy('issue'); setError(null);
    try { onIssued(await createCertificate(body)); }
    catch (e) { setError(apiErrorMessage(e, 'Could not issue the certificate. Please check eligibility again.')); setReviewed(null); }
    finally { setBusy(null); }
  }
  return { studentId, setStudentId, levelId, setLevelId, uploaded, setUploaded, design, setDesign, file, upload,
    busy, error, current, showPreview, issue, onReady, onPreviewError,
    canPreview: !!studentId && !!levelId && (!uploaded || !!file),
    canIssue: !!current?.eligibility.eligible && reviewed === key && !busy };
}
