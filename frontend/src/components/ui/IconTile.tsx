import type { IconType } from 'react-icons';
import { TONE_CLASSES } from '../../lib/theme';
import type { Tone } from '../../types';

type IconTileProps = {
 icon: IconType;
 tone?: Tone;
 size?: 'sm' | 'md' | 'lg';
 variant?: 'solid' | 'soft';
 className?: string;
};

const SIZES: Record<NonNullable<IconTileProps['size']>, string> = {
 sm: 'size-9 text-base',
 md: 'size-11 text-lg',
 lg: 'size-14 text-2xl',
};

export function IconTile({
 icon: Icon,
 tone = 'brand',
 size = 'md',
 variant = 'soft',
 className = '',
}: IconTileProps) {
 const tones = TONE_CLASSES[tone];
 const surface = variant === 'solid' ? `${tones.bg} text-white` : `${tones.soft} ${tones.text}`;

 return (
 <span
 className={`inline-flex shrink-0 items-center justify-center rounded-xl ${SIZES[size]} ${surface} ${className}`}
 >
 <Icon aria-hidden />
 </span>
 );
}
