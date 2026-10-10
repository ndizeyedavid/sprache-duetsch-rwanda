import type { ClassGroupItem } from '../../lib/services';
import type { TeachingTeacher } from '../../lib/teaching';
import { ClassTeacherRow } from './ClassTeacherRow';

type ClassRosterProps = {
  classes: ClassGroupItem[];
  teachers: TeachingTeacher[];
  highlightedId: string | null;
  onSaved: () => void;
};

/** Step 2 panel: every class, its level context and its one assign control. */
export function ClassRoster({ classes, teachers, highlightedId, onSaved }: ClassRosterProps) {
  return (
    <ul className="list-none p-0">
      {classes.map((group) => (
        <ClassTeacherRow
          key={group.id}
          group={group}
          teachers={teachers}
          highlighted={group.id === highlightedId}
          onSaved={onSaved}
        />
      ))}
    </ul>
  );
}