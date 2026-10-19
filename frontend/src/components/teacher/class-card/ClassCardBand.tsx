import type { ClassGroupItem } from '../../../lib/services';
import { humanize } from '../../../lib/services';
import { HERO_ART } from '../../hero/hero-art';
import { artForLevel } from './class-insights';

/** Red top of the class card: level code, level name, shift/intake chips and a learner photo. */
export function ClassCardBand({ group }: { group: ClassGroupItem }) {
  const art = HERO_ART[artForLevel(group.level.code)];
  return (
    <div className={`hero-band relative flex min-h-40 overflow-hidden p-5 ${group.isActive ? '' : 'grayscale'}`}>
      <div className="relative z-10 flex max-w-[62%] flex-col">
        <p className="text-[0.625rem] font-semibold uppercase tracking-[0.18em]">{group.level.levelLabel || 'Level'}</p>
        <p className="mt-1 text-5xl font-semibold leading-none tracking-tight">{group.level.code}</p>
        <p className="mt-1.5 line-clamp-1 text-xs">{group.level.title}</p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
          <span className="hero-chip hero-chip-solid px-2.5 py-0.5 text-[0.6875rem]">{humanize(group.shift)}</span>
          <span className="hero-chip px-2.5 py-0.5 text-[0.6875rem]">{group.intake.name}</span>
          {group.isActive ? null : <span className="hero-chip px-2.5 py-0.5 text-[0.6875rem]">Past class</span>}
        </div>
      </div>
      <img src={art.src} alt="" aria-hidden width={art.width} height={art.height} loading="lazy" decoding="async"
        className="pointer-events-none absolute -right-3 bottom-0 h-[92%] w-auto max-w-[55%] object-contain object-right-bottom" />
    </div>
  );
}
