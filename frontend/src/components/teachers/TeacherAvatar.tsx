import type { TeachingTeacher } from '../../lib/teaching';
import { teacherInitials } from './utils';

/** Photo when the teacher uploaded one, otherwise solid brand initials. */
export function TeacherAvatar({ teacher, size = 'size-11' }: { teacher: TeachingTeacher; size?: string }) {
  return teacher.avatarUrl ? (
    <img src={teacher.avatarUrl} alt="" className={`${size} shrink-0 rounded-full object-cover`} />
  ) : (
    <span aria-hidden className={`${size} flex shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white`}>
      {teacherInitials(teacher)}
    </span>
  );
}
