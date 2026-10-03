import { useNavigate } from "react-router-dom";
import { FiLogOut, FiSettings } from "react-icons/fi";
import { Logo } from "../ui/Logo";
import { SidebarLink } from "./SidebarLink";
import { NAV_DIVIDER_MY, NAV_ITEM_PAD_Y, NAV_SECTION_PAD_Y } from "./constants";
import { NAV } from "../../lib/nav";
import type { Role } from "../../types";
import { useSession } from "../../lib/session";

type SidebarProps = {
  role: Role;
  open: boolean;
  onClose: () => void;
};

// daisyUI `menu` themed through its own variables: the active item is a brand pill.
const MENU_CLASS =
  "menu w-full gap-1 px-3 py-0 [--menu-active-bg:var(--color-brand)] [--menu-active-fg:var(--color-white)]";
const TITLE_CLASS = "menu-title pb-1.5 pt-0 text-[10px] font-semibold tracking-[0.14em] text-base-content/50";

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
        className={`workspace-sidebar fixed inset-y-3 left-3 z-50 flex w-60 flex-col rounded-box border border-base-300 bg-base-100/95 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-[110%]"
        }`}
      >
        <div className="flex h-24 shrink-0 items-center px-5">
          <Logo size={36} withWordmark wordmarkClassName="font-bold text-ink" />
        </div>

        <nav aria-label="Main navigation" className={`flex-1 overflow-y-auto scrollbar-slim ${NAV_SECTION_PAD_Y}`}>
          <ul className={MENU_CLASS}>
            <li className={TITLE_CLASS}>{role === "STUDENT" ? "YOUR LEARNING SPACE" : "WORKSPACE"}</li>
            {items.map((item) => (
              <SidebarLink key={item.to} item={item} onNavigate={onClose} />
            ))}
          </ul>

          <div className={`divider mx-6 ${NAV_DIVIDER_MY}`} />

          <ul className={MENU_CLASS}>
            <li className={TITLE_CLASS}>General</li>
            <SidebarLink
              item={{ label: "Settings", to: "/settings", icon: FiSettings }}
              onNavigate={onClose}
            />
            <li>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className={`gap-3 rounded-selector font-medium text-base-content/70 hover:text-coral ${NAV_ITEM_PAD_Y}`}
              >
                <FiLogOut aria-hidden className="shrink-0 text-lg" />
                <span>Log out</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}
