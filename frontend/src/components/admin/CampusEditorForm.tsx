import type { FormEvent } from 'react';
import { useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import type { CampusItem } from '../../lib/services';
import { createCampus,updateCampus } from '../../lib/services';

export function CampusEditorForm({ initial, onSaved }: { initial: CampusItem | null; onSaved: () => void }) {
  const [code, setCode] = useState(initial?.code ?? '');
  const [name, setName] = useState(initial?.name ?? '');

 const [address, setAddress] = useState(initial?.address ?? '');
 const [phone, setPhone] = useState(initial?.phone ?? '');
 const [email, setEmail] = useState(initial?.email ?? '');
 const [formError, setFormError] = useState<string | null>(null);
 const [saving, setSaving] = useState(false);
 const [isActive, setIsActive] = useState(initial?.isActive ?? true);

 async function handleCreate(event: FormEvent) {
 event.preventDefault();
 setFormError(null);
 setSaving(true);
 try {
 const body = {
 code: code.trim().toUpperCase(),
 name: name.trim(),
 address: address.trim() || null,
 phone: phone.trim() || null,
 email: email.trim() || null,
 isActive,
 };
 if (initial) await updateCampus(initial.id, body); else await createCampus(body);
 onSaved();
 } catch (err) {
 setFormError(apiErrorMessage(err, 'Could not create the campus.'));
 } finally {
 setSaving(false);
 }
 }

 return (
 <form onSubmit={handleCreate} className="space-y-3">
 <div className="grid gap-3 sm:grid-cols-2">
 <label className="block">
 <span className="mb-1 block text-xs font-medium">Code</span>
 <input required value={code} onChange={(e) => setCode(e.currentTarget.value)} placeholder="e.g. REMERA" className="input input w-full rounded-field border-line bg-base-200" />
 </label>
 <label className="block">
 <span className="mb-1 block text-xs font-medium">Name</span>
 <input required value={name} onChange={(e) => setName(e.currentTarget.value)} placeholder="e.g. Kigali — Remera" className="input input w-full rounded-field border-line bg-base-200" />
 </label>
 </div>
 <label className="block">
 <span className="mb-1 block text-xs font-medium">Address</span>
 <input value={address} onChange={(e) => setAddress(e.currentTarget.value)} placeholder="e.g. KG 11 Ave, Kigali" className="input input w-full rounded-field border-line bg-base-200" />
 </label>
 <div className="grid gap-3 sm:grid-cols-2">
 <label className="block">
 <span className="mb-1 block text-xs font-medium">Phone</span>
 <input value={phone} onChange={(e) => setPhone(e.currentTarget.value)} placeholder="e.g. +250 788 000 000" className="input input w-full rounded-field border-line bg-base-200" />
 </label>
 <label className="block">
 <span className="mb-1 block text-xs font-medium">Email</span>
 <input type="email" value={email} onChange={(e) => setEmail(e.currentTarget.value)} placeholder="e.g. remera@sparch.rw" className="input input w-full rounded-field border-line bg-base-200" />
 </label>
 </div>
 {formError ? (
 <p role="alert" className="text-xs font-medium text-error">
 {formError}
 </p>
 ) : null}
 <label className="block"><span className="mb-1 block text-xs font-medium">Status</span><select className="select w-full" value={String(isActive)} onChange={e => setIsActive(e.target.value === 'true')}><option value="true">Active</option><option value="false">Inactive</option></select></label>
 <button type="submit" disabled={saving} className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
 {saving ? 'Saving…' : initial ? 'Save changes' : 'Create campus'}
 </button>
 </form>
 );
}
