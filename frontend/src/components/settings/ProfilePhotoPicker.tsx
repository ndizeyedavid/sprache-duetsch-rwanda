import { useRef, useState } from 'react';
import { FiCamera, FiTrash2 } from 'react-icons/fi';
import { apiErrorMessage } from '../../lib/api';
import { prepareProfilePhoto, profilePhotoUrl, uploadProfilePhoto } from '../../lib/profile-photo';
import { updateMyProfile } from '../../lib/services';

type Props = { url: string | null; name: string; disabled: boolean; onSaved: () => Promise<void> };
export function ProfilePhotoPicker({ url, name, disabled, onSaved }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const locked = busy || disabled;
  async function save(file?: File) {
    if (locked) return;
    setBusy(true); setError(null); setNotice(null);
    try {
      if (file) await uploadProfilePhoto(await prepareProfilePhoto(file));
      else await updateMyProfile({ avatarUrl: null });
      await onSaved(); setNotice(file ? 'Profile photo updated.' : 'Profile photo removed.');
    } catch (err) { setError(apiErrorMessage(err, err instanceof Error ? err.message : 'Could not save your photo.')); }
    finally { setBusy(false); }
  }
  return <div className="rounded-box border border-base-300 p-4">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="avatar avatar-placeholder"><div className="size-20 rounded-full bg-base-200 text-xl font-semibold">
        {url ? <img src={profilePhotoUrl(url)} alt={`${name} profile photo`} className="object-cover" /> : <span>{name.split(' ').map(part => part[0]).slice(0, 2).join('')}</span>}
      </div></div>
      <div className="min-w-0 flex-1"><h3 className="text-sm font-semibold">Your profile photo</h3>
        <p className="mt-1 text-xs leading-5 text-base-content/60">JPG, PNG or WebP, up to 5 MB. Photos are resized for faster loading.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn btn-sm min-h-10" type="button" disabled={locked} onClick={() => input.current?.click()}>
            {busy ? <span className="loading loading-spinner loading-xs" aria-hidden /> : <FiCamera aria-hidden />}{url ? 'Change photo' : 'Upload photo'}</button>
          {url ? <button className="btn btn-sm btn-ghost min-h-10" type="button" disabled={locked} onClick={() => void save()}><FiTrash2 aria-hidden />Remove photo</button> : null}
        </div>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={locked} aria-label="Choose profile photo" onChange={event => {
          const file = event.currentTarget.files?.[0]; event.currentTarget.value = ''; if (file) void save(file);
        }} />
        <p className="mt-2 text-xs text-base-content/60">Photo changes save automatically.</p>
      </div>
    </div>
    {error ? <p className="mt-3 text-sm text-error" role="alert">{error}</p> : null}
    {notice ? <p className="mt-3 text-sm" role="status">{notice}</p> : null}
  </div>;
}
