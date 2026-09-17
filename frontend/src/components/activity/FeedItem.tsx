import { FiClock } from 'react-icons/fi';
import { humanize } from '../../lib/services';
import { TYPE_STYLE } from './constants';
import { initials, relative } from './utils';

type Props = { title: string; body: string | null; type: string; actorName: string | null; actorAvatarUrl?: string | null; createdAt: string };

export function FeedItem({ title, body, type, actorName, actorAvatarUrl, createdAt }: Props) {
 const meta = TYPE_STYLE[type] ?? TYPE_STYLE.SYSTEM;
 const Icon = meta.icon;
 return (
 <li className="flex gap-3">
 <span className="flex flex-col items-center">
 <span className={`flex size-9 shrink-0 items-center justify-center rounded-full border ${meta.bg} ${meta.tone} border-current/10`}>
 <Icon aria-hidden className="text-sm" />
 </span>
 <span className="mt-2 h-full w-px grow bg-line" aria-hidden />
 </span>
 <div className="min-w-0 flex-1 pb-6">
 <div className="rounded-box border border-line bg-base-100 p-4">
 <div className="flex flex-wrap items-center gap-2 text-[11px]">
 <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${meta.bg} ${meta.tone}`}>{meta.label}</span>
 <span className="text-muted">· {relative(createdAt)}</span>
 </div>
 <h3 className="mt-1 text-sm font-bold leading-snug">{title}</h3>
 {body ? <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink/80">{body}</p> : null}
 <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
 {actorAvatarUrl ? (
 <img src={actorAvatarUrl} alt={actorName ?? 'Avatar'} className="size-7 rounded-full object-cover" loading="lazy" />
 ) : (
 <span className="flex size-7 items-center justify-center rounded-full bg-base-200 text-[11px] font-bold">{initials(actorName ?? 'Sprache RW')}</span>
 )}
 <span className="text-xs font-medium">{actorName ?? 'Sprache RW'}</span>
 <span className="ml-auto flex items-center gap-1 text-[11px] text-muted"><FiClock aria-hidden />{humanize(type)}</span>
 </div>
 </div>
 </div>
 </li>
 );
}
