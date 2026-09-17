import { useState } from 'react';
import { FiAlertCircle, FiCheck, FiLock } from 'react-icons/fi';
import { apiErrorMessage } from '../../lib/api';
import { changeMyPassword } from '../../lib/services';

export function SecurityPane() {
 const [currentPassword, setCurrentPassword] = useState('');
 const [newPassword, setNewPassword] = useState('');
 const [confirm, setConfirm] = useState('');
 const [saving, setSaving] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [ok, setOk] = useState(false);

 async function handleSubmit(e: React.FormEvent) {
 e.preventDefault();
 if (newPassword.length < 8) { setError('New password must be at least 8 characters.'); return; }
 if (newPassword !== confirm) { setError('New passwords do not match.'); return; }
 setError(null); setOk(false); setSaving(true);
 try {
 await changeMyPassword({ currentPassword, newPassword });
 setOk(true); setCurrentPassword(''); setNewPassword(''); setConfirm('');
 } catch (err) { setError(apiErrorMessage(err, 'Could not change password.')); } finally { setSaving(false); }
 }

 return (
 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="rounded-box border border-line bg-base-200/30 p-3">
 <p className="flex items-center gap-2 text-xs font-semibold"><FiLock aria-hidden className="text-brand" />Change password</p>
 <p className="mt-1 text-xs leading-snug text-muted">Use 8+ characters. Changing your password signs you out everywhere.</p>
 </div>
 <label className="block"><span className="mb-1.5 block text-xs font-medium">Current password *</span><input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.currentTarget.value)} className="input w-full rounded-box border-line bg-base-100 text-sm" /></label>
 <div className="grid gap-3 sm:grid-cols-2">
 <label className="block"><span className="mb-1.5 block text-xs font-medium">New password *</span><input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.currentTarget.value)} className="input w-full rounded-box border-line bg-base-100 text-sm" /></label>
 <label className="block"><span className="mb-1.5 block text-xs font-medium">Confirm *</span><input type="password" required value={confirm} onChange={(e) => setConfirm(e.currentTarget.value)} className="input w-full rounded-box border-line bg-base-100 text-sm" /></label>
 </div>
 {error ? <p role="alert" className="flex gap-2 rounded-box bg-coral-soft px-3 py-2 text-xs font-medium text-[#D8482F]"><FiAlertCircle aria-hidden className="mt-0.5 shrink-0" />{error}</p> : null}
 {ok ? <p role="status" className="flex gap-2 rounded-box bg-brand-soft px-3 py-2 text-xs font-medium text-[#B30A00]"><FiCheck aria-hidden />Password changed — you will be signed out on next refresh.</p> : null}
 <div className="flex justify-end"><button type="submit" disabled={saving} className="btn btn-sm gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">{saving ? <span className="loading loading-spinner loading-xs" /> : <FiLock aria-hidden />}Update password</button></div>
 </form>
 );
}
