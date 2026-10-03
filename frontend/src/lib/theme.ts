/** Chart palette sampled from the design mockup. Recharts needs raw color values. */
export const COLORS = {
  brand: '#B60E1C',
  brandSoft: '#FAE6E5',
  sun: '#C28335',
  sunSoft: '#FDF0CE',
  coral: '#D76D5B',
  navy: '#203044',
  muted: '#7B777C',
  grid: '#ECE2DE',
  white: '#FFFFFF',
} as const;

export type Tone = 'brand' | 'sun' | 'coral' | 'navy' | 'muted';

/** Tailwind class fragments per tone, so badge/card/icon variants stay consistent. */
export const TONE_CLASSES: Record<Tone, { text: string; bg: string; soft: string; hex: string }> = {
  brand: { text: 'text-brand', bg: 'bg-brand', soft: 'bg-brand-soft', hex: COLORS.brand },
  sun: { text: 'text-sun', bg: 'bg-sun', soft: 'bg-sun-soft', hex: COLORS.sun },
  coral: { text: 'text-coral', bg: 'bg-coral', soft: 'bg-coral-soft', hex: COLORS.coral },
  navy: { text: 'text-night', bg: 'bg-night', soft: 'bg-night/5', hex: COLORS.navy },
  muted: { text: 'text-muted', bg: 'bg-muted', soft: 'bg-muted/10', hex: COLORS.muted },
};
