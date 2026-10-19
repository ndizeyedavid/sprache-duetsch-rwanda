import authPhoto from '../../assets/auth-image.webp';
import { AUTH_PHOTO_PLACEHOLDER } from './auth-photo-placeholder';
import { useRetryingImage } from './useRetryingImage';

/**
 * Full-bleed classroom photo that carries the auth pages (/login, /demo, /register…). Purely
 * decorative: no alt text. A blurred inline copy shows instantly; the real photo fades in and
 * retries on its own if the network or the hosting edge briefly refuses it.
 */
export function AuthPhoto() {
  const photo = useRetryingImage(authPhoto);
  return (
    <section className="relative h-[46vh] min-h-[18.75rem] overflow-hidden bg-primary lg:h-full"
      style={{ backgroundImage: `url("${AUTH_PHOTO_PLACEHOLDER}")`, backgroundSize: 'cover', backgroundPosition: '40% 30%' }}>
      <img
        key={photo.url}
        src={photo.url}
        alt=""
        role="presentation"
        aria-hidden="true"
        fetchPriority="high"
        loading="eager"
        decoding="async"
        onLoad={photo.onLoad}
        onError={photo.onError}
        className={`absolute inset-0 h-full w-full object-cover object-[40%_30%] transition-opacity duration-500 ${photo.loaded ? 'opacity-100' : 'opacity-0'}`}
      />
      <div className="absolute inset-0 bg-linear-to-t from-[#1d1511]/80 via-[#1d1511]/15 to-transparent" />
      <div className="absolute bottom-24 left-6 right-6 text-white sm:left-10 lg:bottom-16 lg:left-14 lg:right-auto lg:max-w-lg">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.25em] text-white">A1 – B2 · Kigali, Rwanda</p>
        <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">Learn German, together.</h2>
        <p className="mt-4 hidden max-w-sm text-base leading-relaxed text-white sm:block">
          Lessons, live classes and progress for every level from A1 to B2.
        </p>
      </div>
    </section>
  );
}
