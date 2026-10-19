import { MAIN_SITE_URL } from './BackToSite';

/** School badge sitting on the liquid seam, joining photo and form like a seal. */
export function AuthSeal() {
  return (
    <a href={MAIN_SITE_URL} aria-label="Deutsch Sprache RW homepage"
      className="absolute left-1/2 -top-[3.9375rem] z-10 -translate-x-1/2 rounded-full bg-base-100 p-1.5 transition-transform duration-500 hover:scale-105 lg:-left-34 lg:top-[calc(16%-3.5rem)] lg:translate-x-0 lg:p-2">
      <img src="/logo.png" alt="" width={96} height={96} className="size-19 rounded-full object-contain lg:size-24" />
    </a>
  );
}
