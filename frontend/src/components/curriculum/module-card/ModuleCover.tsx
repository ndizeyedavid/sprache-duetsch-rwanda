import { HERO_ART } from '../../hero/hero-art';

type Props = { number: string; covers: string[]; published: boolean };

/** Photo mosaic from the module's own lessons; a red band with art when no lesson has a photo yet. */
export function ModuleCover({ number, covers, published }: Props) {
  const badge = (
    <span className="absolute left-3 top-3 z-10 flex size-11 items-center justify-center rounded-box bg-base-100 text-lg font-bold text-primary">{number}</span>
  );
  const status = (
    <span className={`absolute right-3 top-3 z-10 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold ${published ? 'bg-base-100 text-primary' : 'bg-base-300 text-base-content'}`}>
      {published ? 'Published' : 'Draft'}
    </span>
  );
  if (!covers.length) {
    const art = HERO_ART.notes;
    return (
      <div className={`hero-band relative h-36 overflow-hidden ${published ? '' : 'grayscale'}`}>
        {badge}{status}
        <img src={art.src} alt="" aria-hidden width={art.width} height={art.height} loading="lazy" className="absolute -bottom-1 right-2 h-[88%] w-auto object-contain" />
      </div>
    );
  }
  const [main, ...side] = covers;
  return (
    <div className={`relative grid h-36 gap-0.5 overflow-hidden bg-base-300 ${side.length ? 'grid-cols-[2fr_1fr]' : ''} ${published ? '' : 'grayscale'}`}>
      {badge}{status}
      <img src={main} alt="" aria-hidden loading="lazy" decoding="async" className="size-full object-cover" />
      {side.length ? (
        <div className={`grid gap-0.5 ${side.length > 1 ? 'grid-rows-2' : ''}`}>
          {side.map((src) => <img key={src} src={src} alt="" aria-hidden loading="lazy" decoding="async" className="size-full min-h-0 object-cover" />)}
        </div>
      ) : null}
      <span className="absolute inset-x-0 bottom-0 h-1.5 bg-primary" aria-hidden />
    </div>
  );
}
