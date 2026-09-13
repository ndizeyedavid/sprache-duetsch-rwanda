import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBell, FiChevronDown, FiGlobe, FiMenu, FiMessageSquare } from 'react-icons/fi';
import { SearchField } from '../ui/SearchField';
import { useApi } from '../../hooks/useApi';
import { fetchMe } from '../../lib/auth-store';
import { humanize, unreadCount } from '../../lib/services';
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
  const me = useApi('auth-me', fetchMe);
  const unread = useApi('unread-count', unreadCount);

  const displayName = me.data ? `${me.data.firstName} ${me.data.lastName}` : '…';
  const displayRole = me.data ? humanize(me.data.role) : '…';
  const unreadTotal = unread.data?.count ?? 0;

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

        <Link to={messagesPath} className="btn btn-ghost btn-sm btn-circle relative text-muted" aria-label="Messages">
          <FiMessageSquare aria-hidden />
          {unreadTotal > 0 ? (
            <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-coral text-[9px] font-bold text-white">
              {unreadTotal > 9 ? '9+' : unreadTotal}
            </span>
          ) : null}
        </Link>
        <Link to={messagesPath} className="btn btn-ghost btn-sm btn-circle text-muted" aria-label="Notifications">
          <FiBell aria-hidden />
        </Link>

        <div className="ml-1 flex items-center gap-2 border-l border-line pl-2 sm:pl-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-brand-tint text-sm font-bold text-brand">
            {me.data ? `${me.data.firstName.charAt(0)}${me.data.lastName.charAt(0)}` : '…'}
          </span>
          <span className="hidden leading-tight lg:block">
            <span className="block text-xs font-semibold">{displayName}</span>
            <span className="block text-[11px] text-muted">{displayRole}</span>
          </span>
        </div>
      </div>
    </header>
  );
}
