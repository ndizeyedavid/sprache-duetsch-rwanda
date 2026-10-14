import { NavLink } from "react-router-dom";
import type { NavItem } from "../../types";
import { NAV_ITEM_PAD_Y } from "./constants";

// Role home pages match exactly, so "Dashboard" isn't active on every child route.
const HOME_PATHS = new Set(["/dashboard", "/teacher", "/admin", "/admin/finance"]);

const BASE = `relative flex items-center gap-3 rounded-field px-3 font-medium transition-colors duration-150 ${NAV_ITEM_PAD_Y}`;
const IDLE = "text-muted hover:bg-base-200 hover:text-base-content active:bg-brand active:text-primary-content";
const CURRENT = "bg-brand font-semibold text-white";

type SidebarLinkProps = { item: NavItem; pending?: boolean; onNavigate: (to: string) => void };

/** Nav row: solid brand fill for the current page and a small dot while the next page opens. */
export function SidebarLink({ item, pending = false, onNavigate }: SidebarLinkProps) {
  return (
    <li>
      <NavLink
        to={item.to}
        end={HOME_PATHS.has(item.to)}
        onClick={() => onNavigate(item.to)}
        className={({ isActive }) => `${BASE} ${isActive ? CURRENT : IDLE}`}
      >
        {({ isActive }) => (
          <>
            <item.icon aria-hidden className="shrink-0 text-lg" />
            <span className="truncate">{item.label}</span>
            {pending && !isActive ? <span aria-hidden className="ml-auto size-1.5 animate-pulse rounded-full bg-brand" /> : null}
            {item.badge && !pending ? (
              <span className={`badge badge-sm ml-auto rounded-full border-0 font-semibold ${isActive ? "bg-white text-brand" : "bg-brand text-primary-content"}`}>
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            ) : null}
          </>
        )}
      </NavLink>
    </li>
  );
}
