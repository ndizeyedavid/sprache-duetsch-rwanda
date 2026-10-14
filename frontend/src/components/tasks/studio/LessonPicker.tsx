import { useApi } from '../../../hooks/useApi';
import { getClassLessons } from '../../../lib/homework';
import type { ClassLesson } from '../../../lib/homework';
import { Field } from './fields';

type Props = { classGroupId: string; value: string | null; onChange: (lessonId: string | null) => void };

/** Optional link to the lesson this homework practises. Only lessons of the class's own level are offered. */
export function LessonPicker({ classGroupId, value, onChange }: Props) {
  const lessons = useApi(`class-lessons-${classGroupId}`, () => getClassLessons(classGroupId), !!classGroupId);
  const modules = (lessons.data ?? []).reduce<{ id: string; title: string; lessons: ClassLesson[] }[]>((groups, lesson) => {
    const group = groups.find(g => g.id === lesson.module.id);
    if (group) group.lessons.push(lesson); else groups.push({ id: lesson.module.id, title: lesson.module.title, lessons: [lesson] });
    return groups;
  }, []);
  const hint = !classGroupId ? 'Choose a class first.' : lessons.error ? lessons.error
    : 'Students see a link to the lesson, and the lesson lists this homework.';
  return (
    <Field label="Practises lesson (optional)" hint={hint}>
      <select className="select select-sm w-full" disabled={!classGroupId || lessons.loading} value={value ?? ''} onChange={e => onChange(e.target.value || null)}>
        <option value="">{lessons.loading && classGroupId ? 'Loading lessons…' : 'No linked lesson'}</option>
        {modules.map(m => (
          <optgroup key={m.id} label={m.title}>
            {m.lessons.map(l => <option key={l.id} value={l.id}>{l.title}{l.isPublished ? '' : ' (not published yet)'}</option>)}
          </optgroup>
        ))}
      </select>
    </Field>
  );
}
