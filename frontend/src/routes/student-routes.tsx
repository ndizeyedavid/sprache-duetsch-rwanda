import { Route } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { STUDENT_ROLES } from "../lib/roles";
import { StudentAttendance } from "../pages/student/Attendance";
import { RequireRole } from "./guards";
import { Activity,AssignmentDetail,Assignments,CourseContents,CourseOverview,Courses,Dashboard,Grades,Messages,Notes,Payments,Placement,Profile,Schedule,StudentActivity,StudentLesson,Teachers } from "./student-pages";

/** Student pages. Rendered inside <Routes> as a fragment. */
export function studentRoutes() {
  return (
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
        <Route path="/attendance" element={<StudentAttendance />} />
        <Route path="/instructors" element={<Teachers />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/placement" element={<Placement />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/payments" element={<Payments />} />
      </Route>
    </Route>
  );
}
