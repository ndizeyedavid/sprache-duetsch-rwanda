import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiChevronDown,
  FiGlobe,
  FiLogOut,
  FiMenu,
  FiSettings,
  FiUser,
} from "react-icons/fi";
import { SearchField } from "../ui/SearchField";
import { roleLabel } from "../../lib/roles";
import { useSession } from "../../lib/session";

const LANGUAGES = ["Deutsch", "English", "Kinyarwanda"];

type TopbarProps = {
  title: string;
  onMenu: () => void;
};

export function Topbar({ title, onMenu }: TopbarProps) {
  const [language, setLanguage] = useState(LANGUAGES[0]);
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
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-base-100/90 px-4 py-3 backdrop-blur lg:px-6">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open navigation"
        className="btn btn-ghost btn-sm btn-circle lg:hidden"
      >
        <FiMenu aria-hidden />
      </button>

      <h1 className="truncate text-base font-semibold sm:text-lg">{title}</h1>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <SearchField
          className="hidden w-52 md:flex lg:w-64"
          placeholder="Search courses, students..."
        />

        <div className="dropdown dropdown-end hidden ">
          <button
            type="button"
            tabIndex={0}
            className="btn btn-ghost btn-sm gap-1 text-xs font-medium"
          >
            <FiGlobe aria-hidden />
            {language}
            <FiChevronDown aria-hidden />
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content menu z-40 w-40 rounded-box bg-base-100 p-2"
          >
            {LANGUAGES.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => setLanguage(item)}
                  className={
                    item === language ? "font-semibold text-brand" : ""
                  }
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="dropdown dropdown-end">
          <button
            type="button"
            tabIndex={0}
            className="ml-1 flex items-center gap-2 border-l border-line pl-2 text-left sm:pl-3"
          >
            <span className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-brand-tint text-sm font-bold text-brand">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
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
              <span className="block text-[11px] text-muted">
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
