import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { TONE_CLASSES } from '../../lib/theme';
import type { Tone } from '../../types';

type StatTileProps = {
 label: string;
 value: string;
 delta?: string;
 tone?: Tone;
 icon?: IconType;
 children?: ReactNode;
 /** `solid` is the filled variant used on the admin headline tiles. */
 variant?: 'plain' | 'solid';
 className?: string;
};

export function StatTile({
 label,
 value,
 delta,
 tone = 'brand',
 icon: Icon,
 children,
 variant = 'plain',
 className = '',
}: StatTileProps) {
 const tones = TONE_CLASSES[tone];
 const solid = variant === 'solid';

 return (
 <div
 className={` relative overflow-hidden rounded-box p-5 ${
 solid ? `${tones.bg} text-white` : 'bg-base-100'
 } ${className}`}
 >
 <div className="flex items-start justify-between gap-3">
 <p className={`text-xs font-medium ${solid ? 'text-white/80' : 'text-muted'}`}>{label}</p>
 {Icon ? (
 <span
 className={`inline-flex size-9 items-center justify-center rounded-xl ${
 solid ? 'bg-white/20 text-white' : `${tones.soft} ${tones.text}`
 }`}
 >
 <Icon aria-hidden />
 </span>
 ) : null}
 </div>
 <p className={`mt-3 text-2xl font-semibold ${solid ? 'text-white' : 'text-ink'}`}>{value}</p>
 {delta ? (
 <p
 className={`mt-1 text-xs font-medium ${
 solid ? 'text-white/85' : 'text-brand'
 }`}
 >
 {delta}
 </p>
 ) : null}
 {children ? <div className="mt-3">{children}</div> : null}
 </div>
 );
}
