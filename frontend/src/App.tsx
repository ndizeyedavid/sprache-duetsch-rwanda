import { Suspense } from "react";
import { Navigate,Outlet,Route,Routes,useLocation } from "react-router-dom";
import { BookLoader } from "./components/common/BookLoader";
import { RouteErrorBoundary } from "./components/common/RouteErrorBoundary";
import { UpdateNotice } from "./components/common/UpdateNotice";
import { AppLayout } from "./components/layout/AppLayout";
import { AuthLayout } from "./components/layout/AuthLayout";
import { RouteProgress } from "./components/layout/RouteProgress";
import type { AuthRole } from "./lib/auth-store";
import {
ADMIN_ROLES,
FINANCE_ROLES,
STAFF_ROLES,
STUDENT_ROLES,
TEACHER_ROLES,
homePath,
} from "./lib/roles";
import { SessionProvider,useSession } from "./lib/session";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { LoginForm } from "./pages/auth/LoginForm";
import { Register } from "./pages/auth/Register";
import { ResetPassword } from "./pages/auth/ResetPassword";
import { StudentAttendance } from "./pages/student/Attendance";
import { VerifyCertificate } from "./pages/VerifyCertificate";
import { VerifyReceipt } from "./pages/VerifyReceipt";
import { DemoAccounts } from "./pages/DemoAccounts";
import { AdminAnnouncements,AdminCertificates,AdminClasses,AdminCourses,AdminDashboard,AdminEnrolments,AdminFinance,AdminIntakes,AdminLiveClass,AdminOrganisation,AdminPeople,AdminResources,AdminSchedule,AdminStudentDetail,AdminStudents,AdminTeaching,AdminTransactions } from './routes/admin-pages';
import { Activity,AssignmentDetail,Assignments,CourseContents,CourseOverview,Courses,Dashboard,Grades,Messages,Profile,Schedule,Settings,StudentActivity,StudentLesson,Teachers } from './routes/student-pages';
import { TeacherAssessments,TeacherAssignments,TeacherAttendance,TeacherClasses,TeacherContent,TeacherDashboard,TeacherGrading,TeacherPeople,TeacherReports,TeacherSchedule } from './routes/teacher-pages';
function PageFallback() {
  return <BookLoader className="min-h-[60vh]" />;
}
/** Sends the visitor to the dashboard that matches their role (or to sign-in). */
function RoleHome() {
  const { user, loading } = useSession();
  if (loading) return <PageFallback />;
  return <Navigate to={user ? homePath[user.role] : "/login"} replace />;
}
/**
 * Route guard: signed-in users only, restricted to the given roles. A user who
 * is not allowed here is redirected to their own dashboard instead of seeing 403s.
 */
function RequireRole({ roles }: { roles: AuthRole[] }) {
  const { user, loading } = useSession();
  if (loading) return <PageFallback />;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role))
    return <Navigate to={homePath[user.role]} replace />;
  return <Outlet />;
}
function AppRoutes() {
  const { pathname } = useLocation();
  return (
    <RouteErrorBoundary resetKey={pathname}>
    <Suspense fallback={<PageFallback />}>
      <RouteProgress />
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/login/teacher" element={<Navigate to="/login" replace />} />
          <Route path="/login/staff" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
        <Route path="/verify/receipt/:id" element={<VerifyReceipt />} />
        <Route path="/verify/:code" element={<VerifyCertificate />} />
        <Route path="/demo" element={<DemoAccounts />} />
        {/* Student */}
        <Route element={<RequireRole roles={STUDENT_ROLES} />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:slug" element={<CourseOverview />} />
            <Route path="/courses/:slug/learn" element={<CourseContents />} />
            <Route
              path="/courses/:slug/learn/:lessonId"
              element={<StudentLesson />}
            />
            <Route
              path="/courses/:slug/learn/:lessonId/activity/:activityId"
              element={<StudentActivity />}
            />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/assignments/:id" element={<AssignmentDetail />} />
            <Route path="/grades" element={<Grades />} />
            <Route path="/attendance" element={<StudentAttendance />} />
            <Route path="/instructors" element={<Teachers />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
        {/* Teacher */}
        <Route element={<RequireRole roles={TEACHER_ROLES} />}>
          <Route element={<AppLayout />}>
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/teacher/classes" element={<TeacherClasses />} />
            <Route
              path="/teacher/classes/:classGroupId/people"
              element={<TeacherPeople />}
            />
            <Route path="/teacher/content" element={<TeacherContent />} />
            <Route
              path="/teacher/assessments"
              element={<TeacherAssessments />}
            />
            <Route path="/teacher/schedule" element={<TeacherSchedule />} />
            <Route path="/teacher/attendance" element={<TeacherAttendance />} />
            <Route path="/teacher/assignments" element={<TeacherAssignments />} />
            <Route path="/teacher/grading" element={<TeacherGrading />} />
            <Route path="/teacher/reports" element={<TeacherReports />} />
            <Route path="/teacher/messages" element={<Messages />} />
            <Route path="/teacher/activity" element={<Activity />} />
          </Route>
        </Route>
        {/* Academic admin + super admin — the academic module, not the finance one */}
        <Route element={<RequireRole roles={ADMIN_ROLES} />}>
          <Route element={<AppLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/assignments" element={<TeacherAssignments />} />
            <Route path="/admin/assessments" element={<TeacherAssessments />} />
            <Route path="/admin/grading" element={<TeacherGrading />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
            <Route path="/admin/classes" element={<AdminClasses />} />
            <Route path="/admin/teaching" element={<AdminTeaching />} />
            <Route path="/admin/attendance" element={<TeacherAttendance />} />
            <Route path="/admin/enrolments" element={<AdminEnrolments />} />
            <Route path="/admin/people" element={<AdminPeople />} />
            <Route path="/admin/schedule" element={<AdminSchedule />} />
            <Route
              path="/admin/announcements"
              element={<AdminAnnouncements />}
            />
            <Route path="/admin/resources" element={<AdminResources />} />
            <Route path="/admin/certificates" element={<AdminCertificates />} />
            <Route path="/admin/live-class" element={<AdminLiveClass />} />
            <Route path="/admin/organisation" element={<AdminOrganisation />} />
            <Route path="/admin/intakes" element={<AdminIntakes />} />
          </Route>
        </Route>
        {/* Academic admin + finance admin + super admin */}
        <Route element={<RequireRole roles={FINANCE_ROLES} />}>
          <Route element={<AppLayout />}>
            <Route path="/admin/finance" element={<AdminFinance />} />
            <Route path="/admin/transactions" element={<AdminTransactions />} />
          </Route>
        </Route>
        {/* Shared by academic + finance admins (the page hides placement for finance) */}
        <Route element={<RequireRole roles={[...ADMIN_ROLES, ...FINANCE_ROLES]} />}>
          <Route element={<AppLayout />}>
            <Route path="/admin/students" element={<AdminStudents />} />
            <Route path="/admin/students/:studentId" element={<AdminStudentDetail />} />
          </Route>
        </Route>
        {/* Shared by all staff (incl. teachers) */}
        <Route element={<RequireRole roles={STAFF_ROLES} />}>
          <Route element={<AppLayout />}>
            <Route path="/admin/messages" element={<Messages />} />
            <Route path="/admin/activity" element={<Activity />} />
          </Route>
        </Route>
        {/* Settings — all authenticated users (Canvas profile), before Sign out */}
        <Route
          element={<RequireRole roles={[...STUDENT_ROLES, ...STAFF_ROLES]} />}
        >
          <Route element={<AppLayout />}>
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
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
      <UpdateNotice />
    </SessionProvider>
  );
}
