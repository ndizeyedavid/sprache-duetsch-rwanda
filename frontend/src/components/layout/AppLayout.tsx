import { Suspense,useEffect,useState } from 'react';
import { Outlet,useLocation } from 'react-router-dom';
import { getPageTitle } from '../../lib/nav';
import { homePath } from '../../lib/roles';
import { AnnouncementBanner } from '../announcements/AnnouncementBanner';
import { AnnouncementPopup } from '../announcements/AnnouncementPopup';
import { AnnouncementsProvider } from '../announcements/AnnouncementsProvider';
import { useSession } from '../../lib/session';
import { BookLoader } from '../common/BookLoader';
import { RouteErrorBoundary } from '../common/RouteErrorBoundary';
import { IntakeScopeProvider } from '../intake-scope/IntakeScopeProvider';
import { UnreadNotificationsProvider } from '../notifications/UnreadNotificationsProvider';
import { SuspendedScreen } from '../student-suspension/SuspendedScreen';
import { useIntakeScope } from '../../lib/intake-scope/store';
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
  // Pages remount when the staff intake changes, so every list refetches in the new scope.
  const intakeScope = useIntakeScope();

  useEffect(() => {
    setNavOpen(false);
    window.scrollTo({ top: 0 });
  }, [pathname]);

  // A suspended (banned) student only gets the alert with the reason; the API refuses everything else anyway.
  if (student && user?.status === 'SUSPENDED') return <SuspendedScreen />;

  return (
    <IntakeScopeProvider enabled={Boolean(user) && !student}>
    <UnreadNotificationsProvider>
    <AnnouncementsProvider>
      {/* flow-root keeps the topbar's top margin inside, so min-h-screen pages never scroll by that margin. */}
      <div className="learning-workspace flow-root min-h-screen">
        <Sidebar role={role} open={navOpen} onClose={() => setNavOpen(false)} />
        {/* rem, like the sidebar width, so both follow the laptop root size together. */}
        <div className="min-w-0 lg:pl-[15.5rem] roomy:pl-[17rem]">
          <Topbar title={getPageTitle(pathname)} onMenu={() => setNavOpen(true)} />
          <main className={`${academicRole && pathname.startsWith('/admin') ? 'academic-workspace' : ''} mx-auto min-w-0 px-4 py-4 roomy:px-6 roomy:py-6 ${student ? DOCK_CLEARANCE : ''} ${pathname === "/dashboard" ? "w-full" : "max-w-[100rem]"}`}>
            <RouteErrorBoundary resetKey={pathname}>
              <Suspense fallback={<BookLoader className="min-h-[50vh]" />}>
                {user && pathname === homePath[user.role] ? <AnnouncementBanner /> : null}
                <div key={`${pathname}|${intakeScope ?? 'all'}`} className="page-enter"><Outlet /></div>
              </Suspense>
            </RouteErrorBoundary>
          </main>
        </div>
        {student ? <MobileDock onMore={() => setNavOpen(true)} /> : null}
        <AnnouncementPopup />
      </div>
    </AnnouncementsProvider>
    </UnreadNotificationsProvider>
    </IntakeScopeProvider>
  );
}
