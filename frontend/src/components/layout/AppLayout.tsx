import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { getPageTitle } from '../../lib/nav';
import { useSession } from '../../lib/session';

export function AppLayout() {
  const { pathname } = useLocation();
  const { user } = useSession();
  const [navOpen, setNavOpen] = useState(false);
  const role = user?.role ?? 'STUDENT';

  useEffect(() => {
    setNavOpen(false);
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-base-200">
      <Sidebar role={role} open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="lg:pl-64">
        <Topbar title={getPageTitle(pathname)} onMenu={() => setNavOpen(true)} />
        <main className="mx-auto max-w-[1440px] px-4 py-5 lg:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
