import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { IntakeScopeChip } from '../intake-scope/IntakeScopeChip';
import { HeroArt } from './HeroArt';
import type { HeroArtKey } from './hero-art';

type Props = {
  /** Small uppercase label above the title, e.g. "Finance". */
  eyebrow: string;
  icon?: IconType;
  title: ReactNode;
  description?: ReactNode;
  /** White-pill buttons/links (use `heroAction` / `heroGhost` class names). */
  actions?: ReactNode;
  /** Status chips or meta shown under the description. */
  meta?: ReactNode;
  /** Themed illustration key; pass `aside` instead for custom right-hand content. */
  art?: HeroArtKey;
  aside?: ReactNode;
  /** White strip under the red band, for contact rows, filters or quick facts. */
  footer?: ReactNode;
  /** The page's data follows the staff intake switcher: show which intake is active. */
  scoped?: boolean;
  /** Shorter band for tool-like pages (messages, players, editors). */
  compact?: boolean;
  /** Render the title as h2 when the page already has an h1. */
  as?: 'h1' | 'h2';
  className?: string;
};

// Laptops (lg) get a tighter band, title and gaps; large monitors (roomy) get the generous ones back.
// The art column is rem, so it shrinks with the text beside it, and narrower below xl so chips and
// buttons keep room to sit on one row in small windows.
const BAND = { full: 'p-5 sm:p-6 lg:py-4.5 roomy:px-8 roomy:py-7', compact: 'px-5 py-4 sm:px-6' };
const TITLE = { full: 'text-2xl sm:text-3xl lg:text-[1.625rem] roomy:text-4xl', compact: 'text-xl sm:text-2xl' };
const ART_COLS = {
  full: 'md:grid-cols-[minmax(0,1fr)_12rem] lg:grid-cols-[minmax(0,1fr)_13.5rem] xl:grid-cols-[minmax(0,1fr)_18.75rem] roomy:grid-cols-[minmax(0,1fr)_21.25rem]',
  compact: 'md:grid-cols-[minmax(0,1fr)_10rem] lg:grid-cols-[minmax(0,1fr)_12.5rem]',
};

/**
 * The one brand-red page header used by every signed-in page: eyebrow, title,
 * short context, white-pill actions, and an illustration on the right.
 */
export function PageHero({ eyebrow, icon: Icon, title, description, actions, meta, art, aside, footer, scoped, compact, as: Heading = 'h1', className = '' }: Props) {
  const side = aside ?? (art ? <HeroArt name={art} tags={!compact} /> : null);
  return (
    <section className={`page-hero card overflow-hidden ${footer ? 'border border-line bg-base-100' : 'border border-primary'} ${className}`}>
      <div className={`relative grid items-center gap-4 hero-band ${compact ? BAND.compact : BAND.full} ${side ? (compact ? ART_COLS.compact : ART_COLS.full) : ''}`}>
        <div className="relative z-10 min-w-0">
          <p className="flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.18em]">
            {Icon ? <Icon aria-hidden /> : null}{eyebrow}
          </p>
          <Heading className={`mt-2 font-semibold leading-tight tracking-tight lg:mt-1.5 roomy:mt-2 ${compact ? TITLE.compact : TITLE.full}`}>{title}</Heading>
          {description ? <div className="mt-2 max-w-2xl text-pretty text-sm leading-6 lg:mt-1.5 lg:max-w-3xl roomy:mt-2">{description}</div> : null}
          {meta || scoped ? <div className="mt-3 flex flex-wrap items-center gap-2 lg:mt-2.5 roomy:mt-3">{scoped ? <IntakeScopeChip /> : null}{meta}</div> : null}
          {actions ? <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3 lg:mt-3 roomy:mt-4">{actions}</div> : null}
        </div>
        {side ? <div className={`relative hidden self-stretch md:block ${compact ? 'min-h-24' : 'min-h-36'}`}>{side}</div> : null}
      </div>
      {footer ? <div className="border-t border-line px-5 py-4 sm:px-6 roomy:px-8">{footer}</div> : null}
    </section>
  );
}
