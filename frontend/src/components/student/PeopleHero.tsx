import { FiMessageCircle,FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { heroAction,heroGhost } from '../hero/hero-actions';
import { PageHero } from '../hero/PageHero';

type Teacher = { id: string; firstName: string };
type Props = { teachers: Teacher[]; classmates: number; groups: number; loaded: boolean; sendingId: string | null; onMessage: (userId: string) => void };

/** Student "People" header: class counts and a one-tap message to the first teacher. */
export function PeopleHero({ teachers, classmates, groups, loaded, sendingId, onMessage }: Props) {
  const teacher = teachers[0];
  return (
    <PageHero
      eyebrow="Zusammen lernen"
      icon={FiUsers}
      title="People"
      description="Your teachers and classmates. Say hallo — practise together and ask questions any time."
      art="team"
      meta={loaded ? <>
        <span className="hero-chip hero-chip-solid">{teachers.length} {teachers.length === 1 ? 'teacher' : 'teachers'}</span>
        <span className="hero-chip">{classmates} {classmates === 1 ? 'classmate' : 'classmates'}</span>
        <span className="hero-chip">{groups} {groups === 1 ? 'group' : 'groups'}</span>
      </> : null}
      actions={<>
        {teacher ? <button type="button" disabled={sendingId === teacher.id} onClick={() => onMessage(teacher.id)} className={heroAction}>
          {sendingId === teacher.id ? <span className="loading loading-spinner loading-xs" /> : <FiMessageCircle aria-hidden />}Message {teacher.firstName}
        </button> : null}
        <Link to="/messages" className={teacher ? heroGhost : heroAction}>Open messages</Link>
      </>}
    />
  );
}
