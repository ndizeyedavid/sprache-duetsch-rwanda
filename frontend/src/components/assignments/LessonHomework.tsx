import { FiEdit3 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { listMyHomework } from '../../lib/homework';
import { dateLabel, statusLabels, statusTone } from './homework/format';

/** Published homework that practises this lesson. Renders nothing when there is none (or it fails to load). */
export function LessonHomework({ lessonId }: { lessonId: string }) {
  const homework = useApi(`lesson-homework-${lessonId}`, () => listMyHomework(lessonId), !!lessonId);
  const items = homework.data ?? [];
  if (!items.length) return null;
  return (
    <section className="card border border-base-300 bg-base-100 p-5" aria-label="Homework for this lesson">
      <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold"><FiEdit3 aria-hidden />Homework for this lesson</h2>
      <ul className="divide-y divide-base-300">
        {items.map(a => {
          const status = a.submissions?.[0]?.status ?? 'NOT_STARTED';
          return (
            <li key={a.id}>
              <Link to={`/assignments/HW-${a.id}`} className="flex flex-wrap items-center justify-between gap-2 py-3 hover:text-primary">
                <span className="min-w-0"><span className="block text-sm font-medium">{a.title}</span>
                  <span className="text-xs text-muted">{a.extension ? `Extended to ${dateLabel(a.dueAt)}` : a.dueAt ? `Due ${dateLabel(a.dueAt, true)}` : 'No deadline'}</span></span>
                <span className={`badge badge-soft badge-sm ${statusTone[status] ?? 'badge-ghost'}`}>{statusLabels[status] ?? status}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
