const CREDITS = [
  { label: 'Developed by', name: 'Dignity Software' },
  { label: 'Deployed on', name: 'Hubfly Space', href: 'https://hubfly.space' },
] as const;

/** Cyan → blue, sampled from the developer's brand artwork (work.png). */
const CREDIT_GRADIENT = 'bg-linear-to-r from-[#5de0e6] via-[#2f95ca] to-[#004aad]';

/** Copyright line plus the build/hosting credits under every auth page. */
export function AuthFooter() {
  return (
    <footer className="mt-12 text-center text-xs text-muted">
      <p>© 2026 Deutsch Sprache RW · Kigali, Rwanda</p>
      <dl className={`mx-auto mt-4 inline-grid grid-cols-[auto_auto] gap-x-3 gap-y-1.5 rounded-box px-5 py-3 text-left text-white [text-shadow:0_1px_2px_rgb(0_42_110_/_0.45)] ${CREDIT_GRADIENT}`}>
        {CREDITS.map((credit) => (
          <div key={credit.label} className="contents">
            <dt className="text-right text-[0.6875rem] font-medium uppercase tracking-[0.15em]">{credit.label}</dt>
            <dd className="font-semibold">
              {'href' in credit ? (
                <a href={credit.href} target="_blank" rel="noopener" className="hover:underline">{credit.name}</a>
              ) : credit.name}
            </dd>
          </div>
        ))}
      </dl>
    </footer>
  );
}
