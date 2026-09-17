import { useState, useEffect } from "react";
import { FiAlertCircle, FiCheck, FiUpload } from "react-icons/fi";
import { apiErrorMessage } from "../../lib/api";
import { updateMyProfile, uploadFile } from "../../lib/services";
import { useSession } from "../../lib/session";

export function ProfilePane() {
 const { user, refresh } = useSession();
 const [firstName, setFirstName] = useState(user?.firstName ?? "");
 const [lastName, setLastName] = useState(user?.lastName ?? "");
 const [phone, setPhone] = useState("");
 const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
 const [saving, setSaving] = useState(false);
 const [uploading, setUploading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [ok, setOk] = useState(false);

 useEffect(() => {
 if (user) {
 setFirstName(user.firstName);
 setLastName(user.lastName);
 setAvatarUrl(user.avatarUrl ?? "");
 }
 }, [user]);

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
 avatarUrl: avatarUrl.trim() || null,
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
 <div className="flex gap-4">
 <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand text-lg font-bold text-white">
 {avatarUrl ? (
 <img
 src={avatarUrl}
 alt="Avatar"
 className="size-16 object-cover"
 />
 ) : (
 `${firstName[0] ?? ""}${lastName[0] ?? ""}`
 )}
 </span>
 <div className="min-w-0 grow space-y-2">
 <p className="text-sm font-semibold">
 {user?.firstName} {user?.lastName}
 </p>
 <p className="text-xs text-muted">
 {user?.email} · {user?.role}
 </p>
 <div className="flex flex-wrap gap-2">
 <label className="btn btn-xs gap-1 rounded-full border-line bg-base-100">
 <FiUpload aria-hidden />
 {uploading ? (
 <span className="loading loading-spinner loading-xs" />
 ) : (
 "Upload avatar"
 )}
 <input
 type="file"
 accept="image/*"
 className="hidden"
 onChange={async (e) => {
 const f = e.currentTarget.files?.[0];
 if (!f) return;
 setUploading(true);
 setError(null);
 try {
 const r = await uploadFile(f);
 setAvatarUrl(r.url);
 } catch (err) {
 setError(apiErrorMessage(err, "Upload failed."));
 } finally {
 setUploading(false);
 e.currentTarget.value = "";
 }
 }}
 />
 </label>
 </div>
 </div>
 </div>

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
 disabled={saving || uploading}
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
