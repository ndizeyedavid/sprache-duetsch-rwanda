import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBell, FiChevronDown, FiGlobe, FiMenu, FiMessageSquare, FiSettings } from 'react-icons/fi';
import { SearchField } from '../ui/SearchField';
import { currentUser } from '../../data/mock';
import { getRole } from '../../lib/nav';

const LANGUAGES = ['Deutsch', 'English', 'Kinyarwanda'];

type TopbarProps = {
  title: string;
  pathname: string;
  onMenu: () => void;
};

export function Topbar({ title, pathname, onMenu }: TopbarProps) {
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const role = getRole(pathname);
  const messagesPath = role === 'admin' ? '/admin' : '/messages';

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
        <SearchField className="hidden w-52 md:flex lg:w-64" placeholder="Search courses, students..." />

        <div className="dropdown dropdown-end hidden sm:block">
          <button type="button" tabIndex={0} className="btn btn-ghost btn-sm gap-1 text-xs font-medium">
            <FiGlobe aria-hidden />
            {language}
            <FiChevronDown aria-hidden />
          </button>
          <ul tabIndex={0} className="dropdown-content menu z-40 w-40 rounded-box bg-base-100 p-2 shadow-lg">
            {LANGUAGES.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => setLanguage(item)}
                  className={item === language ? 'font-semibold text-brand' : ''}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <Link to={messagesPath} className="btn btn-ghost btn-sm btn-circle text-muted" aria-label="Messages">
          <FiMessageSquare aria-hidden />
        </Link>
        <button type="button" className="btn btn-ghost btn-sm btn-circle text-muted" aria-label="Notifications">
          <FiBell aria-hidden />
        </button>
        <button type="button" className="btn btn-ghost btn-sm btn-circle text-muted" aria-label="Settings">
          <FiSettings aria-hidden />
        </button>

        <div className="ml-1 flex items-center gap-2 border-l border-line pl-2 sm:pl-3">
          <img src={currentUser.photo} alt={currentUser.name} className="size-9 rounded-full object-cover" />
          <span className="hidden leading-tight lg:block">
            <span className="block text-xs font-semibold">{currentUser.name}</span>
            <span className="block text-[11px] text-muted">{currentUser.role}</span>
          </span>
        </div>
      </div>
    </header>
  );
}
