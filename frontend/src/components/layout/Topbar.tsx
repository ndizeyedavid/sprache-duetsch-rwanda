import { FiChevronDown,FiLogOut,FiMenu,FiSettings,FiUser } from "react-icons/fi";
import { Link,useNavigate } from "react-router-dom";
import { profilePhotoUrl } from "../../lib/profile-photo";
import { roleLabel } from "../../lib/roles";
import { useSession } from "../../lib/session";
import { IntakeSwitcher } from "../intake-scope/IntakeSwitcher";
import { NotificationBell } from "../notifications/NotificationBell";

type TopbarProps = {
  title: string;
  onMenu: () => void;
};

/** Hamburger (mobile), page title, notification bell and the account menu. */
export function Topbar({ title, onMenu }: TopbarProps) {
  const { user, signOut } = useSession();
  const navigate = useNavigate();

  const profilePath = user?.role === "STUDENT" ? "/profile" : "/settings";
  const displayName = user ? `${user.firstName} ${user.lastName}` : "…";
  const displayRole = user ? roleLabel[user.role] : "…";

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-3 z-30 mx-4 mt-3 flex min-w-0 items-center gap-3 rounded-box border border-base-300 bg-base-100 px-4 py-2 roomy:mx-6 roomy:px-5 roomy:py-3">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open navigation"
        className="btn btn-ghost btn-sm btn-circle lg:hidden"
      >
        <FiMenu aria-hidden />
      </button>

      <p className={`min-w-0 truncate text-base font-semibold sm:text-lg ${user && user.role !== "STUDENT" ? "hidden sm:block" : ""}`}>{title}</p>

      <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-2">
        {/* Staff intake scope sits with the other account-level controls on the right. */}
        <IntakeSwitcher />
        <NotificationBell />

        <div className="dropdown dropdown-end">
          <button
            type="button"
            tabIndex={0}
            aria-label="Account menu"
            className="ml-1 flex items-center gap-2 border-l border-line pl-2 text-left sm:pl-3"
          >
            <span className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-brand text-sm font-bold text-white">
              {user?.avatarUrl ? (
                <img
                  src={profilePhotoUrl(user.avatarUrl)}
                  alt={displayName}
                  className="size-9 object-cover"
                />
              ) : user ? (
                `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
              ) : (
                "…"
              )}
            </span>
            <span className="hidden leading-tight lg:block">
              <span className="block text-xs font-semibold">{displayName}</span>
              <span className="block text-[0.6875rem] text-muted">
                {displayRole}
              </span>
            </span>
            <FiChevronDown className="hidden text-muted lg:block" aria-hidden />
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content menu z-40 w-56 rounded-box bg-base-100 p-2"
          >
            <li className="menu-title">
              <span className="text-xs">
                {displayRole} · {user?.email}
              </span>
            </li>
            <li>
              <Link to={profilePath} className="gap-2">
                <FiUser aria-hidden />
                Profile
              </Link>
            </li>
            <li>
              <Link to="/settings" className="gap-2">
                <FiSettings aria-hidden />
                Settings
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={handleSignOut}
                className="gap-2 text-error"
              >
                <FiLogOut aria-hidden />
                Sign out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
