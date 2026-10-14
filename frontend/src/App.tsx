import { Suspense } from "react";
import { Route,Routes,useLocation } from "react-router-dom";
import { RouteErrorBoundary } from "./components/common/RouteErrorBoundary";
import { AppUpdater } from "./components/common/AppUpdater";
import { RouteProgress } from "./components/layout/RouteProgress";
import { SessionProvider } from "./lib/session";
import { adminRoutes } from "./routes/admin-routes";
import { PageFallback,RoleHome } from "./routes/guards";
import { publicRoutes } from "./routes/public-routes";
import { studentRoutes } from "./routes/student-routes";
import { teacherRoutes } from "./routes/teacher-routes";

// Each role's routes live in routes/*-routes.tsx; add new pages there, not here.
function AppRoutes() {
  const { pathname } = useLocation();
  return (
    <RouteErrorBoundary resetKey={pathname}>
      <Suspense fallback={<PageFallback />}>
        <RouteProgress />
        <Routes>
          {publicRoutes()}
          {studentRoutes()}
          {teacherRoutes()}
          {adminRoutes()}
          <Route path="/" element={<RoleHome />} />
          <Route path="*" element={<RoleHome />} />
        </Routes>
      </Suspense>
    </RouteErrorBoundary>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <AppRoutes />
      <AppUpdater />
    </SessionProvider>
  );
}
