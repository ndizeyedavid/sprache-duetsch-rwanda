import { HERO_ART,type HeroArtKey } from './hero-art';

/** Cut-out photo on the brand red, with two floating German phrase tags. */
export function HeroArt({ name, tags = true }: { name: HeroArtKey; tags?: boolean }) {
  const art = HERO_ART[name];
  return (
    <div className="pointer-events-none absolute -bottom-5 -right-5 -top-5 left-0 sm:-bottom-6 sm:-right-6 roomy:-bottom-7 roomy:-right-8" aria-hidden="true">
      <img src={art.src} alt="" width={art.width} height={art.height} loading="lazy" decoding="async"
        className="absolute inset-0 h-full w-full object-contain object-bottom" />
      {/* The narrow md column has no room for the phrase tags; they would cover the picture. */}
      {tags && art.tags[0] ? <span className="hero-tag left-0 top-5 hidden border-primary text-primary lg:block">{art.tags[0]}</span> : null}
      {tags && art.tags[1] ? <span className="hero-tag bottom-6 right-6 hidden text-base-content lg:block">{art.tags[1]}</span> : null}
    </div>
  );
}
