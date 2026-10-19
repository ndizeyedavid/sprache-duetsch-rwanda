import { FiArrowLeft,FiAward,FiBookOpen,FiEdit3 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { heroGhost } from '../hero/hero-actions';
import { PageHero } from '../hero/PageHero';
import type { AssignmentDetailData } from './types';
import { humanType } from './utils';

const back = <Link to="/assignments" className={heroGhost}><FiArrowLeft aria-hidden />All assignments</Link>;

/** Shown while an assignment loads, so the header never jumps. */
export function AssignmentHeroPlaceholder() {
  return <PageHero eyebrow="Assignment" icon={FiEdit3} title="Your assignment" art="assignments" actions={back} />;
}

/** Quiz / test / activity header: level and type, title, linked lesson and the way back. */
export function AssignmentDetailHeader({ data }: { data: AssignmentDetailData }) {
  const activity = data.source === 'ACTIVITY';
  const level = data.lesson?.module.level ?? data.level;
  const lessonPath = data.lesson && level?.code ? `/courses/${level.code.toLowerCase()}/learn/${data.lesson.id}` : null;
  return (
    <PageHero
      eyebrow={`${level?.code ? `${level.code} · ` : ''}${humanType((activity ? data.activity?.type : data.assessment?.type) ?? (activity ? 'Activity' : 'Assessment'))}`}
      icon={activity ? FiEdit3 : FiAward}
      title={(activity ? data.activity?.title : data.assessment?.title) ?? 'Assignment'}
      description={data.lesson ? `Practises: ${data.lesson.title}` : null}
      art={activity ? 'assignments' : 'grades'}
      actions={<>
        {back}
        {lessonPath ? <Link to={lessonPath} className={heroGhost}><FiBookOpen aria-hidden />Open lesson</Link> : null}
      </>}
    />
  );
}
