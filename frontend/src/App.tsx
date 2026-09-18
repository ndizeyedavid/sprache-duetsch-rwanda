import { Suspense, lazy } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { AuthLayout } from "./components/layout/AuthLayout";
import { RouteProgress } from "./components/layout/RouteProgress";
import { LoadingBlock } from "./components/common/PageState";
import { LoginStudent } from "./pages/auth/LoginStudent";
import { LoginTeacher } from "./pages/auth/LoginTeacher";
import { LoginStaff } from "./pages/auth/LoginStaff";
import { Register } from "./pages/auth/Register";
import { VerifyCertificate } from "./pages/VerifyCertificate";
import { SessionProvider, useSession } from "./lib/session";
import {
 ADMIN_ROLES,
 FINANCE_ROLES,
 STAFF_ROLES,
 STUDENT_ROLES,
 TEACHER_ROLES,
 homePath,
} from "./lib/roles";
import type { AuthRole } from "./lib/auth-store";

// ---------------------------------------------------------------------------
// Student pages
// ---------------------------------------------------------------------------
const Dashboard = lazy(() =>
 import("./pages/student/Dashboard").then((module) => ({ default: module.Dashboard })),
);
const Courses = lazy(() =>
 import("./pages/student/Courses").then((module) => ({ default: module.Courses })),
);
const CourseOverview = lazy(() =>
 import("./pages/student/CourseOverview").then((module) => ({ default: module.CourseOverview })),
);
const CourseContents = lazy(() =>
  import("./pages/student/CourseContents").then((module) => ({ default: module.CourseContents })),
);
const StudentLesson = lazy(() =>
  import("./pages/student/LessonView").then((module) => ({ default: module.StudentLesson })),
);
const StudentActivity = lazy(() =>
  import("./pages/student/StudentActivity").then((module) => ({ default: module.StudentActivity })),
);
const Schedule = lazy(() =>
 import("./pages/student/Schedule").then((module) => ({ default: module.Schedule })),
);
const Teachers = lazy(() =>
  import("./pages/student/Teachers").then((module) => ({ default: module.Teachers })),
);
const Grades = lazy(() =>
  import("./pages/student/Grades").then((module) => ({ default: module.Grades })),
);
const Assignments = lazy(() =>
  import("./pages/student/Assignments").then((module) => ({ default: module.Assignments })),
);
const AssignmentDetail = lazy(() =>
  import("./pages/student/AssignmentDetail").then((module) => ({ default: module.AssignmentDetail })),
);
const Profile = lazy(() =>
  import("./pages/student/Profile").then((module) => ({ default: module.Profile })),
);

// ---------------------------------------------------------------------------
// Shared pages (every role)
// ---------------------------------------------------------------------------
const Messages = lazy(() =>
 import("./pages/shared/Messages").then((module) => ({ default: module.Messages })),
);
const Activity = lazy(() =>
 import("./pages/shared/Activity").then((module) => ({ default: module.Activity })),
);
const Settings = lazy(() =>
 import("./pages/shared/Settings").then((module) => ({ default: module.Settings })),
);

// ---------------------------------------------------------------------------
// Teacher pages
// ---------------------------------------------------------------------------
const TeacherDashboard = lazy(() =>
 import("./pages/teacher/Dashboard").then((module) => ({ default: module.TeacherDashboard })),
);
const TeacherClasses = lazy(() =>
 import("./pages/teacher/Classes").then((module) => ({ default: module.TeacherClasses })),
);
const TeacherSchedule = lazy(() =>
 import("./pages/teacher/Schedule").then((module) => ({ default: module.TeacherSchedule })),
);
const TeacherAttendance = lazy(() =>
 import("./pages/teacher/Attendance").then((module) => ({ default: module.TeacherAttendance })),
);
const TeacherGrading = lazy(() =>
  import("./pages/teacher/Grading").then((module) => ({ default: module.TeacherGrading })),
);
const TeacherReports = lazy(() =>
  import("./pages/teacher/Reports").then((module) => ({ default: module.TeacherReports })),
);
const TeacherContent = lazy(() =>
 import("./pages/teacher/Content").then((module) => ({ default: module.TeacherContent })),
);
const TeacherAssessments = lazy(() =>
 import("./pages/teacher/Assessments").then((module) => ({ default: module.TeacherAssessments })),
);
const TeacherPeople = lazy(() =>
 import("./pages/teacher/People").then((module) => ({ default: module.TeacherPeople })),
);

// ---------------------------------------------------------------------------
// Admin / finance pages
// ---------------------------------------------------------------------------
const AdminDashboard = lazy(() =>
 import("./pages/admin/Dashboard").then((module) => ({ default: module.AdminDashboard })),
);
const AdminFinance = lazy(() =>
 import("./pages/admin/Finance").then((module) => ({ default: module.AdminFinance })),
);
const AdminCourses = lazy(() =>
 import("./pages/admin/Courses").then((module) => ({ default: module.AdminCourses })),
);
const AdminSchedule = lazy(() =>
 import("./pages/admin/Schedule").then((module) => ({ default: module.AdminSchedule })),
);
const AdminStudents = lazy(() =>
 import("./pages/admin/Students").then((module) => ({ default: module.AdminStudents })),
);
const AdminResources = lazy(() =>
 import("./pages/admin/Resources").then((module) => ({ default: module.AdminResources })),
);
const AdminTransactions = lazy(() =>
 import("./pages/admin/Transactions").then((module) => ({ default: module.AdminTransactions })),
);
const AdminCertificates = lazy(() =>
 import("./pages/admin/Certificates").then((module) => ({ default: module.AdminCertificates })),
);
const AdminLiveClass = lazy(() =>
 import("./pages/admin/LiveClass").then((module) => ({ default: module.AdminLiveClass })),
);
const AdminClasses = lazy(() =>
 import("./pages/admin/Classes").then((module) => ({ default: module.AdminClasses })),
);
const AdminEnrolments = lazy(() =>
 import("./pages/admin/Enrolments").then((module) => ({ default: module.AdminEnrolments })),
);
const AdminPeople = lazy(() =>
 import("./pages/admin/People").then((module) => ({ default: module.AdminPeople })),
);
const AdminAnnouncements = lazy(() =>
 import("./pages/admin/Announcements").then((module) => ({ default: module.AdminAnnouncements })),
);
const AdminOrganisation = lazy(() =>
 import("./pages/admin/Organisation").then((module) => ({ default: module.AdminOrganisation })),
);

function PageFallback() {
 return (
 <div
 className="flex min-h-[40vh] items-center justify-center"
 role="status"
 aria-live="polite"
 >
 <span className="loading loading-spinner loading-lg text-brand" />
 <span className="sr-only">Loading…</span>
 </div>
 );
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
 if (loading) return <LoadingBlock label="Checking access…" />;
 if (!user) return <Navigate to="/login" replace />;
 if (!roles.includes(user.role)) return <Navigate to={homePath[user.role]} replace />;
 return <Outlet />;
}

function AppRoutes() {
 return (
 <Suspense fallback={<PageFallback />}>
 <RouteProgress />
 <Routes>
 <Route element={<AuthLayout portal="student" />}>
 <Route path="/login" element={<LoginStudent />} />
 <Route path="/register" element={<Register />} />
 </Route>
 <Route element={<AuthLayout portal="teacher" />}>
 <Route path="/login/teacher" element={<LoginTeacher />} />
 </Route>
 <Route element={<AuthLayout portal="staff" />}>
 <Route path="/login/staff" element={<LoginStaff />} />
 </Route>

 <Route path="/verify/:code" element={<VerifyCertificate />} />

 {/* Student */}
 <Route element={<RequireRole roles={STUDENT_ROLES} />}>
 <Route element={<AppLayout />}>
 <Route path="/dashboard" element={<Dashboard />} />
 <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:slug" element={<CourseOverview />} />
            <Route path="/courses/:slug/learn" element={<CourseContents />} />
            <Route path="/courses/:slug/learn/:lessonId" element={<StudentLesson />} />
            <Route path="/courses/:slug/learn/:lessonId/activity/:activityId" element={<StudentActivity />} />
  <Route path="/schedule" element={<Schedule />} />
  <Route path="/assignments" element={<Assignments />} />
  <Route path="/assignments/:id" element={<AssignmentDetail />} />
  <Route path="/grades" element={<Grades />} />
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
 <Route path="/teacher/classes/:classGroupId/people" element={<TeacherPeople />} />
 <Route path="/teacher/content" element={<TeacherContent />} />
 <Route path="/teacher/assessments" element={<TeacherAssessments />} />
 <Route path="/teacher/schedule" element={<TeacherSchedule />} />
            <Route path="/teacher/attendance" element={<TeacherAttendance />} />
            <Route path="/teacher/grading" element={<TeacherGrading />} />
            <Route path="/teacher/reports" element={<TeacherReports />} />
            <Route path="/teacher/messages" element={<Messages />} />
 <Route path="/teacher/activity" element={<Activity />} />
 </Route>
 </Route>

 {/* Academic admin + super admin */}
 <Route element={<RequireRole roles={ADMIN_ROLES} />}>
 <Route element={<AppLayout />}>
 <Route path="/admin" element={<AdminDashboard />} />
 <Route path="/admin/courses" element={<AdminCourses />} />
 <Route path="/admin/classes" element={<AdminClasses />} />
 <Route path="/admin/enrolments" element={<AdminEnrolments />} />
 <Route path="/admin/people" element={<AdminPeople />} />
 <Route path="/admin/schedule" element={<AdminSchedule />} />
 <Route path="/admin/announcements" element={<AdminAnnouncements />} />
 <Route path="/admin/resources" element={<AdminResources />} />
 <Route path="/admin/certificates" element={<AdminCertificates />} />
 <Route path="/admin/live-class" element={<AdminLiveClass />} />
 <Route path="/admin/organisation" element={<AdminOrganisation />} />
 </Route>
 </Route>

 {/* Finance admin + super admin */}
 <Route element={<RequireRole roles={FINANCE_ROLES} />}>
 <Route element={<AppLayout />}>
 <Route path="/admin/finance" element={<AdminFinance />} />
 <Route path="/admin/transactions" element={<AdminTransactions />} />
 </Route>
 </Route>

 {/* Shared by academic + finance admins */}
 <Route element={<RequireRole roles={[...ADMIN_ROLES, ...FINANCE_ROLES]} />}>
 <Route element={<AppLayout />}>
 <Route path="/admin/students" element={<AdminStudents />} />
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
 <Route element={<RequireRole roles={[...STUDENT_ROLES, ...STAFF_ROLES]} />}>
 <Route element={<AppLayout />}>
 <Route path="/settings" element={<Settings />} />
 </Route>
 </Route>

 <Route path="/" element={<RoleHome />} />
 <Route path="*" element={<RoleHome />} />
 </Routes>
 </Suspense>
 );
}

export default function App() {
 return (
 <SessionProvider>
 <AppRoutes />
 </SessionProvider>
 );
}
