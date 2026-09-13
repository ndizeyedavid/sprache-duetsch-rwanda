import { NavLink } from 'react-router-dom';
import { FiZap } from 'react-icons/fi';
import { NAV } from '../../lib/nav';
import type { Role } from '../../types';

type SidebarProps = {
  role: Role;
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ role, open, onClose }: SidebarProps) {
  const items = NAV[role];

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-night/40 lg:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-base-100 transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2 px-6 py-6">
          <span className="text-xl font-bold tracking-tight text-ink">
            Sparch
            <span className="text-brand">.</span>
          </span>
          <span className="rounded-full bg-brand-tint px-2 py-0.5 text-[10px] font-semibold uppercase text-brand">
            {role === 'admin' ? 'Admin' : 'LMS'}
          </span>
        </div>

        <nav aria-label="Main navigation" className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-4">
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/dashboard' || item.to === '/admin'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-field px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand text-white shadow-[0_10px_20px_rgba(76,188,154,0.35)]'
                        : 'text-muted hover:bg-base-200 hover:text-ink'
                    }`
                  }
                >
                  <item.icon className="shrink-0 text-lg" aria-hidden />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4">
          <div className="relative overflow-hidden rounded-box bg-night p-4 text-white">
            <span className="inline-flex size-9 items-center justify-center rounded-xl bg-brand text-white">
              <FiZap aria-hidden />
            </span>
            <p className="mt-3 text-sm font-semibold leading-snug">
              {role === 'admin' ? 'Generate monthly report' : 'Upgrade your Account to Pro'}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-white/70">
              {role === 'admin'
                ? 'Export enrolment, attendance and payment summaries as PDF.'
                : 'Unlock live classes, certificates and full audio library.'}
            </p>
            <button
              type="button"
              className="btn btn-xs mt-3 w-full rounded-full border-0 bg-brand text-white hover:bg-brand/90"
            >
              {role === 'admin' ? 'Generate' : 'Upgrade Now'}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
