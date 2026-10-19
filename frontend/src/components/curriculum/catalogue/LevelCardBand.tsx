import type { LevelItem } from '../../../lib/services';
import { HERO_ART } from '../../hero/hero-art';
import { artForLevel } from '../../teacher/class-card/class-insights';

/** Red top of a course card: level label, big code, and a round lesson photo (art if none yet). */
export function LevelCardBand({ level, cover }: { level: LevelItem; cover: string | undefined }) {
  // Courses without lesson photos still differ from each other (and from the page header).
  const art = HERO_ART[artForLevel(level.code)];
  const long = level.code.length > 3;
  return (
    <div className={`hero-band relative flex h-44 overflow-hidden p-6 ${level.isActive ? '' : 'grayscale'}`}>
      <span aria-hidden className="absolute -bottom-10 -right-8 size-52 rounded-full bg-brand-soft" />
      <div className="relative z-10 flex w-[50%] min-w-0 flex-col">
        <p className="text-[0.625rem] font-semibold uppercase leading-relaxed tracking-[0.2em]">{level.levelLabel || 'Course'}</p>
        <p className={`mt-1 break-words font-semibold leading-none tracking-tight ${long ? 'text-3xl' : 'text-5xl'}`}>{level.code}</p>
        <p className="mt-auto text-[0.6875rem]">{level.language}</p>
      </div>
      {cover ? (
        <img src={cover} alt="" aria-hidden loading="lazy" decoding="async"
          className="absolute -bottom-6 right-4 size-40 rounded-full border-4 border-primary-content object-cover object-[50%_65%]" />
      ) : (
        <img src={art.src} alt="" aria-hidden width={art.width} height={art.height} loading="lazy"
          className="absolute bottom-0 right-0 h-[95%] w-auto max-w-[55%] object-contain object-bottom" />
      )}
      {level.isActive ? null : <span className="hero-chip hero-chip-solid absolute right-3 top-3 z-10 text-[0.6875rem]">Hidden from students</span>}
    </div>
  );
}
