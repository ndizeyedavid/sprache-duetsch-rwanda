import { useMemo } from 'react';
import { FiArrowLeft,FiRefreshCw } from 'react-icons/fi';
import { Link,useParams } from 'react-router-dom';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { heroGhost } from '../../components/hero/hero-actions';
import { PageHero } from '../../components/hero/PageHero';
import { PracticeSession } from '../../components/learn/session/PracticeSession';
import type { SessionConfig } from '../../components/learn/types';
import { Panel } from '../../components/ui/Panel';
import { useApi } from '../../hooks/useApi';
import { getMyCourses,getMyReview,saveMyReview } from '../../lib/services';

/** Daily review ("Wiederholen"): the questions you missed, plus words from lessons you finished. */
export function Review() {
  const { slug = '' } = useParams();
  const courses = useApi('my-courses', getMyCourses);
  const course = useMemo(() => courses.data?.find((c) => c.level.code.toLowerCase() === slug.toLowerCase()) ?? null, [courses.data, slug]);
  const levelId = course?.level.id ?? '';
  const review = useApi(`review-${levelId}`, () => getMyReview(levelId), Boolean(levelId) && !course?.paymentRequired);
  const code = course?.level.code ?? slug.toUpperCase();
  const back = `/courses/${slug.toLowerCase()}/learn`;
  const hero = <PageHero compact eyebrow={`${code} · Review`} icon={FiRefreshCw} title="Wiederholen · Review" art="assignments"
    description={review.data ? `${review.data.mistakes ? `${review.data.mistakes} question${review.data.mistakes === 1 ? '' : 's'} you missed` : 'No recent mistakes'} · words from finished lessons` : 'Practise what you found hard, a little every day.'}
    actions={<Link to={back} className={heroGhost}><FiArrowLeft aria-hidden />{code} course map</Link>} />;
  if (courses.loading || review.loading) return <div className="space-y-4">{hero}<LoadingBlock label="Preparing your review…" /></div>;
  if (courses.error || review.error) return <div className="space-y-4">{hero}<ErrorBlock message={courses.error ?? review.error ?? 'Could not load the review.'} onRetry={review.refetch} /></div>;
  if (!review.data?.items.length) return <div className="space-y-4">{hero}<Panel><EmptyBlock title="Nothing to review yet" hint="Finish a lesson's practice sessions first — your mistakes and new words will come back here." /></Panel></div>;
  const config = { v: 2, session: 'review', titleEn: 'Review', items: review.data.items } as SessionConfig;
  return <div className="space-y-4">
    {hero}
    <PracticeSession key={review.data.items.length} title="Wiederholen" config={config} content={null} glossary={review.data.glossary}
      backHref={back} nextHref={null} save={(payload) => saveMyReview(levelId, payload)} />
  </div>;
}
