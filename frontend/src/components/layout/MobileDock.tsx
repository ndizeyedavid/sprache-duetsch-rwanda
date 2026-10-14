import type { IconType } from "react-icons";
import { FiBook,FiCreditCard,FiFileText,FiHome,FiMenu } from "react-icons/fi";
import { NavLink } from "react-router-dom";

type DockLink = { label: string; to: string; icon: IconType; end?: boolean };

/** The four places a student opens most on a phone; everything else lives behind "More". */
const LINKS: DockLink[] = [
  { label: "Home", to: "/dashboard", icon: FiHome, end: true },
  { label: "Course", to: "/courses", icon: FiBook },
  { label: "Assignments", to: "/assignments", icon: FiFileText },
  { label: "Payments", to: "/payments", icon: FiCreditCard },
];

/** daisyUI dock: student bottom navigation on small screens only. */
export function MobileDock({ onMore }: { onMore: () => void }) {
  return (
    <nav aria-label="Quick navigation" className="dock dock-sm z-30 border-t border-base-300 lg:hidden">
      {LINKS.map(({ label, to, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? "dock-active text-brand" : "text-muted")}>
          <Icon aria-hidden className="text-lg" />
          <span className="dock-label">{label}</span>
        </NavLink>
      ))}
      <button type="button" onClick={onMore} aria-label="More pages" className="text-muted">
        <FiMenu aria-hidden className="text-lg" />
        <span className="dock-label">More</span>
      </button>
    </nav>
  );
}
