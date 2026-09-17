import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit2, FiEyeOff, FiUsers } from 'react-icons/fi';
import { humanize } from '../../lib/services';
import { useSession } from '../../lib/session';

type ClassGroupCardProps = {
 id: string;
 code: string;
 name: string;
 levelCode: string;
 intakeName: string;
 campusName: string;
 shift: string;
 studentCount: number;
 color: string;
 unreadCount?: number;
 isHidden?: boolean;
 onToggleHidden?: (id: string) => void;
};

function nicknameKey(userId: string | undefined, classGroupId: string): string {
 return `sparch.nickname.${userId ?? 'anon'}.${classGroupId}`;
}

function colorKey(userId: string | undefined, classGroupId: string): string {
 return `sparch.color.${userId ?? 'anon'}.${classGroupId}`;
}

export function ClassGroupCard({
 id,
 code,
 name,
 levelCode,
 intakeName,
 campusName,
 shift,
 studentCount,
 color,
 unreadCount = 0,
 isHidden = false,
 onToggleHidden,
}: ClassGroupCardProps) {
 const { user } = useSession();
 const nickKey = useMemo(() => nicknameKey(user?.id, id), [user?.id, id]);
 const colKey = useMemo(() => colorKey(user?.id, id), [user?.id, id]);

 const [nickname, setNickname] = useState(() => localStorage.getItem(nickKey) ?? '');
 const [editing, setEditing] = useState(false);
 const [draft, setDraft] = useState(nickname);
 const [customColor, setCustomColor] = useState(() => localStorage.getItem(colKey) ?? color);

 // Re-read when the session resolves (first render has anon keys).
 useEffect(() => {
 setNickname(localStorage.getItem(nickKey) ?? '');
 }, [nickKey]);
 useEffect(() => {
 setDraft(nickname);
 }, [nickname]);
 useEffect(() => {
 setCustomColor(localStorage.getItem(colKey) ?? color);
 }, [colKey, color]);

 const displayName = nickname.trim() || name;
 const activeColor = customColor || color;

 function saveNickname() {
 const value = draft.trim();
 if (value) {
 localStorage.setItem(nickKey, value);
 setNickname(value);
 } else {
 localStorage.removeItem(nickKey);
 setNickname('');
 }
 setEditing(false);
 }

 function handleColorChange(value: string) {
 setCustomColor(value);
 localStorage.setItem(colKey, value);
 }

 return (
 <article
 className={` relative flex flex-col overflow-hidden rounded-box bg-base-100 ${isHidden ? 'opacity-60' : ''}`}
 >
 <div className="h-2 w-full" style={{ background: activeColor }} aria-hidden />

 <div className="flex grow flex-col p-4">
 <div className="flex items-start justify-between gap-2">
 <span className="inline-flex rounded-full bg-base-200 px-2 py-0.5 text-[11px] font-semibold text-ink">
 {levelCode}
 </span>
 {unreadCount > 0 ? (
 <span className="flex size-5 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white" aria-label={`${unreadCount} ungraded`}>
 {unreadCount > 9 ? '9+' : unreadCount}
 </span>
 ) : null}
 </div>

 {editing ? (
 <div className="mt-2 flex gap-2">
 <input
 value={draft}
 onChange={(event) => setDraft(event.currentTarget.value)}
 placeholder={name}
 className="input input grow rounded-field border-line bg-base-200"
 aria-label="Course nickname"
 />
 <button type="button" onClick={saveNickname} className="btn btn-sm rounded-full border-0 bg-brand text-white">
 Save
 </button>
 <button type="button" onClick={() => setEditing(false)} className="btn btn-sm rounded-full border-line bg-base-200">
 Cancel
 </button>
 </div>
 ) : (
 <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug">{displayName}</h3>
 )}

 <p className="mt-1 text-xs text-muted">
 {code} · {campusName} · {humanize(shift)}
 </p>
 <p className="mt-0.5 text-xs text-muted">
 {intakeName} · {studentCount} student{studentCount === 1 ? '' : 's'}
 </p>

 <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
 <label className="flex items-center gap-1 text-muted">
 Color
 <input type="color" value={activeColor} onChange={(event) => handleColorChange(event.currentTarget.value)} className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0" aria-label="Card color" />
 </label>
 <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-1 text-muted hover:text-ink">
 <FiEdit2 aria-hidden /> Rename
 </button>
 {onToggleHidden ? (
 <button type="button" onClick={() => onToggleHidden(id)} className="inline-flex items-center gap-1 text-muted hover:text-ink">
 <FiEyeOff aria-hidden /> {isHidden ? 'Show' : 'Hide'}
 </button>
 ) : null}
 </div>

 <div className="mt-4 flex gap-2">
 <Link to={`/teacher/classes/${id}/people`} className="btn btn-sm grow gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90">
 <FiUsers aria-hidden />
 People
 </Link>
 <Link
 to={`/teacher/grading?classGroupId=${id}&status=SUBMITTED`}
 className="btn btn-sm grow rounded-full border-brand bg-transparent text-brand hover:border-brand hover:bg-brand hover:text-white"
 >
 Grade
 </Link>
 </div>
 </div>
 </article>
 );
}
