import { FiFileText } from 'react-icons/fi';
import { TONE_CLASSES } from '../../lib/theme';
import type { ActivityItem } from '../../types';

type ActivityRowProps = {
 item: ActivityItem;
 className?: string;
};

export function ActivityRow({ item, className = '' }: ActivityRowProps) {
 const tone = TONE_CLASSES[item.targetTone];

 return (
 <li className={`flex gap-4 ${className}`}>
 <span className="w-16 shrink-0 pt-0.5 text-[11px] text-muted">{item.time}</span>
 <div className="flex min-w-0 flex-1 gap-3">
 <img
 src={item.photo}
 alt={item.actor}
 loading="lazy"
 className="size-9 shrink-0 rounded-full object-cover"
 />
 <div className="min-w-0 flex-1 pb-5">
 <p className="text-sm leading-relaxed">
 <span className="font-semibold">{item.actor}</span> <span className="text-muted">{item.action}</span>{' '}
 <span className={`font-semibold ${tone.text}`}>{item.target}</span>
 </p>
 {item.attachments?.length ? (
 <div className="mt-2 flex flex-wrap gap-2">
 {item.attachments.map((file) => (
 <span
 key={file.name}
 className="flex items-center gap-2 rounded-xl bg-base-200 px-3 py-2 text-[11px] font-medium"
 >
 <FiFileText className="text-brand" aria-hidden />
 {file.name}
 <span className="text-muted">{file.size}</span>
 </span>
 ))}
 </div>
 ) : null}
 </div>
 </div>
 </li>
 );
}
