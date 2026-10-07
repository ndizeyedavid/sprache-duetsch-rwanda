import { FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { humanize } from '../../../lib/services';

type Props = { slug: string; lessonId: string; code: string; title: string; type: string };
export function ActivityNavigation({ slug, lessonId, code, title, type }: Props) {
  return <>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Link to="/courses" className="hover:underline">My courses</Link><span className="text-muted">/</span>
        <Link to={`/courses/${slug}/learn`} className="hover:underline">{code}</Link><span className="text-muted">/</span>
        <Link to={`/courses/${slug}/learn/${lessonId}`} className="hover:underline">Lesson</Link><span className="text-muted">/</span>
        <span className="font-medium text-ink truncate">{title}</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link to={`/courses/${slug}/learn/${lessonId}`} className="btn btn-xs gap-1 rounded-full border-line bg-base-100"><FiArrowLeft aria-hidden />Back to lesson</Link>
        <span className="rounded-full bg-base-200 px-2.5 py-1 text-xs font-medium">{humanize(type)}</span>
      </div>

  </>;
}
