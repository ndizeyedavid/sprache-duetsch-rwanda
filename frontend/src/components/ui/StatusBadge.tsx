import { statusTone, TONE_SURFACE } from '../../lib/status';

type StatusBadgeProps = {
 status: string;
 className?: string;
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
 const tone = statusTone(status);
 return (
 <span
 className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium ${TONE_SURFACE[tone]} ${className}`}
 >
 {status}
 </span>
 );
}
