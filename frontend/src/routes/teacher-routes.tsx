import { Route } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { TEACHER_ROLES } from "../lib/roles";
import { RequireRole } from "./guards";
import { Activity,Messages } from "./student-pages";
import { TeacherAssessments,TeacherAssignments,TeacherAttendance,TeacherClasses,TeacherContent,TeacherDashboard,TeacherGrading,TeacherPeople,TeacherReports,TeacherSchedule } from "./teacher-pages";

/** Teacher pages. Rendered inside <Routes> as a fragment. */
export function teacherRoutes() {
  return (
    <Route element={<RequireRole roles={TEACHER_ROLES} />}>
      <Route element={<AppLayout />}>
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/classes" element={<TeacherClasses />} />
        <Route path="/teacher/classes/:classGroupId/people" element={<TeacherPeople />} />
        <Route path="/teacher/content" element={<TeacherContent />} />
        <Route path="/teacher/assessments" element={<TeacherAssessments />} />
        <Route path="/teacher/schedule" element={<TeacherSchedule />} />
        <Route path="/teacher/attendance" element={<TeacherAttendance />} />
        <Route path="/teacher/assignments" element={<TeacherAssignments />} />
        <Route path="/teacher/grading" element={<TeacherGrading />} />
        <Route path="/teacher/reports" element={<TeacherReports />} />
        <Route path="/teacher/messages" element={<Messages />} />
        <Route path="/teacher/activity" element={<Activity />} />
      </Route>
    </Route>
  );
}
