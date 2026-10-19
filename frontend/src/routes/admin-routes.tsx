import { Navigate,Route } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { ADMIN_ROLES,FINANCE_ROLES,STAFF_ROLES,STUDENT_ROLES } from "../lib/roles";
import { AdminAnnouncements,AdminApplications,AdminCertificates,AdminClasses,AdminCourses,AdminDashboard,AdminEnrolments,AdminFinance,AdminIntakes,AdminLiveClass,AdminOrganisation,AdminPeople,AdminReports,AdminResources,AdminSchedule,AdminStudentDetail,AdminStudents,AdminTeachers,AdminTransactions } from "./admin-pages";
import { RequireRole } from "./guards";
import { Activity,Messages,Notifications,Settings } from "./student-pages";
import { TeacherAssessments,TeacherAssignments,TeacherAttendance,TeacherGrading } from "./teacher-pages";

/** Academic, finance and shared staff pages plus Settings. Rendered inside <Routes> as a fragment. */
export function adminRoutes() {
  return (
    <>
      {/* Academic admin + super admin — the academic module, not the finance one */}
      <Route element={<RequireRole roles={ADMIN_ROLES} />}>
        <Route element={<AppLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/assignments" element={<TeacherAssignments />} />
          <Route path="/admin/assessments" element={<TeacherAssessments />} />
          <Route path="/admin/grading" element={<TeacherGrading />} />
          <Route path="/admin/courses" element={<AdminCourses />} />
          <Route path="/admin/classes" element={<AdminClasses />} />
          <Route path="/admin/teachers" element={<AdminTeachers />} />
          <Route path="/admin/teaching" element={<Navigate to="/admin/teachers" replace />} />
          <Route path="/admin/attendance" element={<TeacherAttendance />} />
          <Route path="/admin/enrolments" element={<AdminEnrolments />} />
          <Route path="/admin/applications" element={<AdminApplications />} />
          <Route path="/admin/people" element={<AdminPeople />} />
          <Route path="/admin/schedule" element={<AdminSchedule />} />
          <Route path="/admin/announcements" element={<AdminAnnouncements />} />
          <Route path="/admin/resources" element={<AdminResources />} />
          <Route path="/admin/certificates" element={<AdminCertificates />} />
          <Route path="/admin/live-class" element={<AdminLiveClass />} />
          <Route path="/admin/organisation" element={<AdminOrganisation />} />
          <Route path="/admin/intakes" element={<AdminIntakes />} />
          <Route path="/admin/reports" element={<AdminReports />} />
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
      <Route element={<RequireRole roles={[...STUDENT_ROLES, ...STAFF_ROLES]} />}>
        <Route element={<AppLayout />}>
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>
      </Route>
    </>
  );
}
