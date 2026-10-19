const CREDITS = [
  { label: 'Developed by', name: 'Dignity Software' },
  { label: 'Deployed on', name: 'Hubfly Space', href: 'https://hubfly.space' },
] as const;

/** Copyright line plus the build/hosting credits under every auth page. */
export function AuthFooter() {
  return (
    <footer className="mt-12 text-center text-xs text-muted">
      <p>© 2026 Deutsch Sprache RW · Kigali, Rwanda</p>
      <dl className="mx-auto mt-4 inline-grid grid-cols-[auto_auto] gap-x-3 gap-y-1.5 border-t border-base-300 pt-4 text-left">
        {CREDITS.map((credit) => (
          <div key={credit.label} className="contents">
            <dt className="text-right text-[0.6875rem] uppercase tracking-[0.15em]">{credit.label}</dt>
            <dd className="font-semibold text-base-content">
              {'href' in credit ? (
                <a href={credit.href} target="_blank" rel="noopener" className="hover:text-brand hover:underline">{credit.name}</a>
              ) : credit.name}
            </dd>
          </div>
        ))}
      </dl>
    </footer>
  );
}
