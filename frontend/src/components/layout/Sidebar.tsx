import { NavLink, useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { Logo } from "../ui/Logo";
import { NAV } from "../../lib/nav";
import type { Role } from "../../types";
import { useSession } from "../../lib/session";

type SidebarProps = {
  role: Role;
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ role, open, onClose }: SidebarProps) {
  const items = NAV[role];
  const { signOut } = useSession();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate("/login", { replace: true });
  }

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
        className={`fixed inset-y-0 left-0 z-50 flex w-28 flex-col border-r border-line bg-base-100 transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-center px-4 py-4">
          <Logo size={80} />
        </div>

        <nav
          aria-label="Main navigation"
          className="flex-1 overflow-y-auto scrollbar-thin pb-4"
        >
          <ul>
            {items.map((item) => (
              <li
                key={item.to}
                className="border-b border-line/60 last:border-b-0"
              >
                <NavLink
                  to={item.to}
                  end={
                    item.to === "/dashboard" ||
                    item.to === "/teacher" ||
                    item.to === "/admin" ||
                    item.to === "/admin/finance"
                  }
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1.5 px-2 py-4 text-center text-[11px] font-medium leading-tight transition-colors ${
                      isActive
                        ? "bg-brand text-white"
                        : "text-muted hover:bg-base-200 hover:text-ink"
                    }`
                  }
                >
                  <item.icon className="shrink-0 text-[23px]" aria-hidden />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-line">
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex w-full flex-col items-center gap-1.5 px-2 py-4 text-center text-[11px] font-medium leading-tight text-muted transition-colors hover:bg-coral-soft hover:text-coral"
          >
            <FiLogOut className="shrink-0 text-[22px]" aria-hidden />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
