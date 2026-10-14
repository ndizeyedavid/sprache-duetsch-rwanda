import { Suspense,useEffect,useState } from 'react';
import { Outlet,useLocation } from 'react-router-dom';
import { getPageTitle } from '../../lib/nav';
import { useSession } from '../../lib/session';
import { AcademicWorkspaceBar } from '../admin/AcademicWorkspaceBar';
import { BookLoader } from '../common/BookLoader';
import { RouteErrorBoundary } from '../common/RouteErrorBoundary';
import { UnreadNotificationsProvider } from '../notifications/UnreadNotificationsProvider';
import { DOCK_CLEARANCE } from './constants';
import { MobileDock } from './MobileDock';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  const { pathname } = useLocation();
  const { user } = useSession();
  const [navOpen, setNavOpen] = useState(false);
  const role = user?.role ?? 'STUDENT';
  const academicRole = role === 'ACADEMIC_ADMIN' || role === 'SUPER_ADMIN';
  const student = role === 'STUDENT';

  useEffect(() => {
    setNavOpen(false);
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <UnreadNotificationsProvider>
      <div className="learning-workspace min-h-screen">
        <Sidebar role={role} open={navOpen} onClose={() => setNavOpen(false)} />
        <div className="lg:pl-[272px]">
          <Topbar title={getPageTitle(pathname)} onMenu={() => setNavOpen(true)} />
          <main className={`${academicRole && pathname.startsWith('/admin') ? 'academic-workspace' : ''} mx-auto px-4 py-5 lg:px-6 lg:py-6 ${student ? DOCK_CLEARANCE : ''} ${pathname === "/dashboard" ? "w-full" : "max-w-[1600px]"}`}>
            {academicRole && pathname.startsWith('/admin/') ? <AcademicWorkspaceBar pathname={pathname} title={getPageTitle(pathname)} /> : null}
            <RouteErrorBoundary resetKey={pathname}>
              <Suspense fallback={<BookLoader className="min-h-[50vh]" />}>
                <div key={pathname} className="page-enter"><Outlet /></div>
              </Suspense>
            </RouteErrorBoundary>
          </main>
        </div>
        {student ? <MobileDock onMore={() => setNavOpen(true)} /> : null}
      </div>
    </UnreadNotificationsProvider>
  );
}
