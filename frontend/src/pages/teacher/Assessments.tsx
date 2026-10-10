import { Navigate } from 'react-router-dom';
import { useSession } from '../../lib/session';

/** Quizzes and tests now live in Assignments; old links land there. */
export function TeacherAssessments() {
  const { user } = useSession();
  return <Navigate to={`${user?.role === 'TEACHER' ? '/teacher' : '/admin'}/assignments`} replace />;
}
