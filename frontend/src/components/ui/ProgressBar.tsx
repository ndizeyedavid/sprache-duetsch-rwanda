import { TONE_CLASSES } from '../../lib/theme';
import type { Tone } from '../../types';

type ProgressBarProps = {
 value: number;
 tone?: Tone;
 className?: string;
};

export function ProgressBar({ value, tone = 'brand', className = '' }: ProgressBarProps) {
 return (
 <div
 className={`h-2 w-full overflow-hidden rounded-full bg-base-300 ${className}`}
 role="progressbar"
 aria-valuenow={value}
 aria-valuemin={0}
 aria-valuemax={100}
 >
 <div
 className={`h-full rounded-full ${TONE_CLASSES[tone].bg}`}
 style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
 />
 </div>
 );
}

type ProgressRowProps = {
 label: string;
 value: number;
 caption: string;
 tone?: Tone;
};

export function ProgressRow({ label, value, caption, tone = 'sun' }: ProgressRowProps) {
 return (
 <div className="mb-4 last:mb-0">
 <div className="mb-2 flex items-center justify-between text-xs">
 <span className="font-medium">{label}</span>
 <span className="text-muted">{caption}</span>
 </div>
 <ProgressBar value={value} tone={tone} />
 </div>
 );
}
