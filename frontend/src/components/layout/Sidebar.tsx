import { NavLink } from "react-router-dom";
import { Logo } from "../ui/Logo";
import { NAV } from "../../lib/nav";
import type { Role } from "../../types";

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
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-center px-6 py-6">
          <Logo size={120} />
        </div>

        <nav
          aria-label="Main navigation"
          className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-4"
        >
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/dashboard" || item.to === "/admin"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-field px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-brand text-white shadow-[0_10px_20px_rgba(251,13,0,0.35)]"
                        : "text-muted hover:bg-base-200 hover:text-ink"
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
      </aside>
    </>
  );
}
