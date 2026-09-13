import { Suspense, lazy } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { AuthLayout } from "./components/layout/AuthLayout";
import { RouteProgress } from "./components/layout/RouteProgress";
import { LoadingBlock } from "./components/common/PageState";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { VerifyCertificate } from "./pages/VerifyCertificate";
import { useApi } from "./hooks/useApi";
import { clearTokens, fetchMe, isSignedIn } from "./lib/auth-store";

const Dashboard = lazy(() =>
  import("./pages/student/Dashboard").then((module) => ({
    default: module.Dashboard,
  })),
);
const AdminDashboard = lazy(() =>
  import("./pages/admin/Dashboard").then((module) => ({
    default: module.AdminDashboard,
  })),
);
const AdminCourses = lazy(() =>
  import("./pages/admin/Courses").then((module) => ({
    default: module.AdminCourses,
  })),
);
const AdminSchedule = lazy(() =>
  import("./pages/admin/Schedule").then((module) => ({
    default: module.AdminSchedule,
  })),
);
const AdminStudents = lazy(() =>
  import("./pages/admin/Students").then((module) => ({
    default: module.AdminStudents,
  })),
);
const AdminResources = lazy(() =>
  import("./pages/admin/Resources").then((module) => ({
    default: module.AdminResources,
  })),
);
const AdminTransactions = lazy(() =>
  import("./pages/admin/Transactions").then((module) => ({
    default: module.AdminTransactions,
  })),
);
const AdminLiveClass = lazy(() =>
  import("./pages/admin/LiveClass").then((module) => ({
    default: module.AdminLiveClass,
  })),
);
const AdminCertificates = lazy(() =>
  import("./pages/admin/Certificates").then((module) => ({
    default: module.AdminCertificates,
  })),
);

const Courses = lazy(() =>
  import("./pages/student/Courses").then((module) => ({
    default: module.Courses,
  })),
);
const CourseOverview = lazy(() =>
  import("./pages/student/CourseOverview").then((module) => ({
    default: module.CourseOverview,
  })),
);
const CourseContents = lazy(() =>
  import("./pages/student/CourseContents").then((module) => ({
    default: module.CourseContents,
  })),
);
const Schedule = lazy(() =>
  import("./pages/student/Schedule").then((module) => ({
    default: module.Schedule,
  })),
);
const Teachers = lazy(() =>
  import("./pages/student/Teachers").then((module) => ({
    default: module.Teachers,
  })),
);
const Messages = lazy(() =>
  import("./pages/student/Messages").then((module) => ({
    default: module.Messages,
  })),
);
const Activity = lazy(() =>
  import("./pages/student/Activity").then((module) => ({
    default: module.Activity,
  })),
);
const Profile = lazy(() =>
  import("./pages/student/Profile").then((module) => ({
    default: module.Profile,
  })),
);

function PageFallback() {
  return (
    <div
      className="flex min-h-[40vh] items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <span className="loading loading-spinner loading-lg text-brand" />
      <span className="sr-only">Seite wird geladen…</span>
    </div>
  );
}

function RequireAuth() {
  if (!isSignedIn()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

function RequireStaff() {
  const me = useApi('auth-me', fetchMe);
  if (me.loading) return <LoadingBlock label="Checking access…" />;
  if (me.error || !me.data) {
    clearTokens();
    return <Navigate to="/login" replace />;
  }
  if (me.data.role === 'STUDENT') {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <RouteProgress />
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route path="/verify/:code" element={<VerifyCertificate />} />

        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:slug" element={<CourseOverview />} />
            <Route path="/courses/:slug/learn" element={<CourseContents />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/instructors" element={<Teachers />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/profile" element={<Profile />} />

            <Route element={<RequireStaff />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/courses" element={<AdminCourses />} />
              <Route path="/admin/schedule" element={<AdminSchedule />} />
              <Route path="/admin/students" element={<AdminStudents />} />
              <Route path="/admin/resources" element={<AdminResources />} />
          <Route path="/admin/transactions" element={<AdminTransactions />} />
          <Route path="/admin/certificates" element={<AdminCertificates />} />
          <Route path="/admin/live-class" element={<AdminLiveClass />} />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
