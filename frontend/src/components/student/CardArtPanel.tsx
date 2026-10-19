import type { ReactNode } from 'react';
import { HERO_ART,type HeroArtKey } from '../hero/hero-art';

type Props = { art: HeroArtKey; children: ReactNode; /** Text on top, photo filling the rest — for tall, narrow cards. */ stacked?: boolean };

/** Soft red panel with a photo cut-out; grows to fill a dashboard card's spare height. */
export function CardArtPanel({ art, children, stacked = false }: Props) {
  const image = HERO_ART[art];
  if (stacked) {
    return (
      <div className="flex min-h-56 flex-1 flex-col overflow-hidden rounded-box bg-brand-tint">
        <div className="flex flex-col gap-1.5 p-4 pb-0">{children}</div>
        <div className="relative min-h-32 flex-1">
          <img src={image.src} alt="" aria-hidden width={image.width} height={image.height} loading="lazy" decoding="async"
            className="pointer-events-none absolute inset-0 h-full w-full object-contain object-bottom" />
        </div>
      </div>
    );
  }
  return (
    <div className="relative flex min-h-32 flex-1 overflow-hidden rounded-box bg-brand-tint">
      <div className="relative z-10 flex max-w-[62%] flex-col justify-center gap-1.5 p-4">{children}</div>
      <img src={image.src} alt="" aria-hidden width={image.width} height={image.height} loading="lazy" decoding="async"
        className="pointer-events-none absolute bottom-0 right-0 h-[95%] max-h-60 w-auto max-w-[45%] object-contain object-right-bottom" />
    </div>
  );
}
