import { ProfilePhotoPicker } from './ProfilePhotoPicker';
import { useEffect,useState } from "react";
import { FiAlertCircle,FiCheck } from "react-icons/fi";
import { apiErrorMessage } from "../../lib/api";
import { updateMyProfile } from "../../lib/services";
import { useSession } from "../../lib/session";

export function ProfilePane() {
 const { user, refresh } = useSession();
 const [firstName, setFirstName] = useState(user?.firstName ?? "");
 const [lastName, setLastName] = useState(user?.lastName ?? "");
 const [phone, setPhone] = useState(user?.phone ?? "");
 const [saving, setSaving] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [ok, setOk] = useState(false);

 useEffect(() => {
 setFirstName(user?.firstName ?? '');
 setLastName(user?.lastName ?? '');
 setPhone(user?.phone ?? '');
 }, [user?.id, user?.firstName, user?.lastName, user?.phone]);

 async function handleSubmit(e: React.FormEvent) {
 e.preventDefault();
 if (!firstName.trim() || !lastName.trim()) {
 setError("First and last name are required.");
 return;
 }
 setError(null);
 setOk(false);
 setSaving(true);
 try {
 await updateMyProfile({
 firstName: firstName.trim(),
 lastName: lastName.trim(),
 phone: phone.trim() || null,
 });
 setOk(true);
 await refresh();
 } catch (err) {
 setError(apiErrorMessage(err, "Could not save profile."));
 } finally {
 setSaving(false);
 }
 }

 return (
 <form onSubmit={handleSubmit} className="space-y-4">
 <ProfilePhotoPicker url={user?.avatarUrl ?? null} name={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`} disabled={saving} onSaved={refresh} />

 <div className="grid gap-3 sm:grid-cols-2">
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">First name *</span>
 <input
 required
 value={firstName}
 onChange={(e) => setFirstName(e.currentTarget.value)}
 className="input w-full rounded-box border-line bg-base-100 text-sm"
 />
 </label>
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Last name *</span>
 <input
 required
 value={lastName}
 onChange={(e) => setLastName(e.currentTarget.value)}
 className="input w-full rounded-box border-line bg-base-100 text-sm"
 />
 </label>
 </div>
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Phone</span>
 <input
 value={phone}
 onChange={(e) => setPhone(e.currentTarget.value)}
 placeholder={user?.email ? "Add your phone" : ""}
 className="input w-full rounded-box border-line bg-base-100 text-sm"
 />
 </label>
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Email</span>
 <input
 value={user?.email ?? ""}
 disabled
 className="input w-full rounded-box border-line bg-base-200 text-sm"
 />
 <span className="mt-1 block text-[11px] text-muted">
 Email cannot be changed — contact an admin.
 </span>
 </label>

 {error ? (
 <p
 role="alert"
 className="flex gap-2 rounded-box bg-coral-soft px-3 py-2 text-xs font-medium text-[#D8482F]"
 >
 <FiAlertCircle aria-hidden className="mt-0.5 shrink-0" />
 {error}
 </p>
 ) : null}
 {ok ? (
 <p
 role="status"
 className="flex gap-2 rounded-box bg-brand-soft px-3 py-2 text-xs font-medium text-[#B30A00]"
 >
 <FiCheck aria-hidden />
 Profile saved.
 </p>
 ) : null}

 <div className="flex justify-end">
 <button
 type="submit"
 disabled={saving}
 className="btn btn-sm gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60"
 >
 {saving ? (
 <span className="loading loading-spinner loading-xs" />
 ) : (
 <FiCheck aria-hidden />
 )}
 Save changes
 </button>
 </div>
 </form>
 );
}
