import { Link, Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-night p-10 text-white lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-brand/25 blur-3xl"
        />
        <Link to="/" className="relative text-xl font-bold tracking-tight">
          Sparch<span className="text-brand">.</span>
        </Link>
        <div className="relative max-w-sm">
          <h2 className="text-3xl font-semibold leading-snug">
            Deutsch lernen, <span className="text-brand">Schritt für Schritt.</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Level-based courses A1 to B2, live evening classes, downloadable audio notes and progress you can track
            on any phone.
          </p>
          <dl className="mt-8 grid grid-cols-3 gap-4">
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-white/60">Levels</dt>
              <dd className="text-lg font-semibold">A1–B2</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-white/60">Campuses</dt>
              <dd className="text-lg font-semibold">3</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-white/60">Students</dt>
              <dd className="text-lg font-semibold">1.2k</dd>
            </div>
          </dl>
        </div>
        <p className="relative text-xs text-white/50">© 2025 Sparch Deutsch Rwanda</p>
      </div>

      <div className="flex items-center justify-center bg-base-200 px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 block text-xl font-bold tracking-tight text-ink lg:hidden">
            Sparch<span className="text-brand">.</span>
          </Link>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
