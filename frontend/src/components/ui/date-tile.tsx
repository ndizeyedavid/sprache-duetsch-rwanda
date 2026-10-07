import { TONE_CLASSES } from "../../lib/theme";
import type { DateTileProps } from './date-tile-props';
export function DateTile({
 day,
 month,
 tone = "brand",
 className = "",
}: DateTileProps) {
 const tones = TONE_CLASSES[tone];

 return (
 <div
 className={`flex size-12 shrink-0 flex-col items-center justify-center rounded-xl ${tones.soft} ${tones.text} ${className}`}
 >
 <span className="text-sm font-semibold leading-none">{day}</span>
 <span className="mt-0.5 text-[10px] uppercase tracking-wide">
 {month}
 </span>
 </div>
 );
}
