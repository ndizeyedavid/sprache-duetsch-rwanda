/** Full-bleed classroom photo that carries the auth pages. */
export function AuthPhoto() {
  return (
    <section className="relative h-[46vh] min-h-[300px] overflow-hidden lg:h-full">
      <img
        src="/auth-image.webp"
        alt="Two Deutsch Sprache RW students working through a German lesson together"
        className="absolute inset-0 h-full w-full object-cover object-[40%_30%]"
      />
      <div aria-hidden className="absolute inset-0 bg-linear-to-t from-[#1d1511]/80 via-[#1d1511]/15 to-transparent" />
      <div className="absolute bottom-24 left-6 right-6 text-white sm:left-10 lg:bottom-16 lg:left-14 lg:right-auto lg:max-w-lg">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/75">A1 – B2 · Kigali, Rwanda</p>
        <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">Learn German, together.</h2>
        <p className="mt-4 hidden max-w-sm text-base leading-relaxed text-white/80 sm:block">
          Lessons, live classes and progress for every level from A1 to B2.
        </p>
      </div>
    </section>
  );
}
