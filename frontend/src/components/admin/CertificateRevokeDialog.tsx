import type { FormEvent } from 'react';
import { useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import type { Certificate } from '../../lib/services';
import { revokeCertificate } from '../../lib/services';
import { Modal } from '../ui/Modal';

export function CertificateRevokeDialog({ certificate, onClose, onRevoked }: { certificate: Certificate; onClose: () => void; onRevoked: () => void }) {
 const [reason, setReason] = useState('');
 const [saving, setSaving] = useState(false);
 const [error, setError] = useState<string | null>(null);
 async function submit(event: FormEvent) {
   event.preventDefault(); setSaving(true); setError(null);
   try { await revokeCertificate(certificate.id, reason.trim()); onRevoked(); }
   catch (err) { setError(apiErrorMessage(err, 'Could not revoke the certificate.')); }
   finally { setSaving(false); }
 }
 return <Modal open onClose={() => { if (!saving) onClose(); }} title="Revoke certificate"><form onSubmit={submit} className="space-y-4"><p className="break-all text-xs text-base-content/60">{certificate.certificateNumber}</p><label className="block"><span className="mb-2 block text-xs font-medium">Reason</span><textarea required minLength={4} disabled={saving} className="textarea w-full" value={reason} onChange={e => setReason(e.target.value)} /></label>{error && <p role="alert" className="text-xs text-error">{error}</p>}<div className="modal-action"><button type="button" disabled={saving} onClick={onClose} className="btn btn-sm rounded-full">Cancel</button><button disabled={saving || reason.trim().length < 4} className="btn btn-error btn-sm rounded-full">{saving ? 'Revoking…' : 'Revoke'}</button></div></form></Modal>;
}
