import { NavLink } from "react-router-dom";
import type { NavItem } from "../../types";
import { NAV_ITEM_PAD_Y } from "./constants";

// Role home pages match exactly, so "Dashboard" isn't active on every child route.
const HOME_PATHS = new Set(["/dashboard", "/teacher", "/admin", "/admin/finance"]);

type SidebarLinkProps = {
  item: NavItem;
  onNavigate: () => void;
};

/** Nav row: the active route is a filled brand pill (daisyUI `menu-active`). */
export function SidebarLink({ item, onNavigate }: SidebarLinkProps) {
  return (
    <li>
      <NavLink
        to={item.to}
        end={HOME_PATHS.has(item.to)}
        onClick={onNavigate}
        className={({ isActive }) =>
          `gap-3 rounded-selector font-medium ${NAV_ITEM_PAD_Y} ${
            isActive ? "menu-active shadow-none" : "text-base-content/70 hover:text-base-content"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <item.icon aria-hidden className="shrink-0 text-lg" />
            <span className="truncate">{item.label}</span>
            {item.badge ? (
              <span
                className={`badge badge-sm rounded-full border-0 font-semibold ${
                  isActive ? "bg-white text-brand" : "bg-brand text-white"
                }`}
              >
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            ) : null}
          </>
        )}
      </NavLink>
    </li>
  );
}
