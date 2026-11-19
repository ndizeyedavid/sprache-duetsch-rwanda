import { useMemo,useState } from 'react';
import { FiArrowLeft,FiBookOpen } from 'react-icons/fi';
import { Link,useParams } from 'react-router-dom';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { heroGhost } from '../../components/hero/hero-actions';
import { PageHero } from '../../components/hero/PageHero';
import { byLesson,searchWords } from '../../components/learn/words/word-search';
import { WordRow } from '../../components/learn/words/WordRow';
import { Panel } from '../../components/ui/Panel';
import { SearchField } from '../../components/ui/SearchField';
import { useApi } from '../../hooks/useApi';
import { getMyCourses } from '../../lib/services';
import { getMyWordList } from '../../lib/services/my-word-list';

/** Wortschatz · Word list: every lesson's words with English, examples and audio, searchable in both languages. */
export function WordList() {
  const { slug = '' } = useParams();
  const courses = useApi('my-courses', getMyCourses);
  const course = useMemo(() => courses.data?.find((c) => c.level.code.toLowerCase() === slug.toLowerCase()) ?? null, [courses.data, slug]);
  const levelId = course?.level.id ?? '';
  const words = useApi(`word-list-${levelId}`, () => getMyWordList(levelId), Boolean(levelId) && !course?.paymentRequired);
  const [query, setQuery] = useState('');
  const [lessonId, setLessonId] = useState('');
  const all = useMemo(() => words.data ?? [], [words.data]);
  const groups = useMemo(() => byLesson(searchWords(all, query, lessonId)), [all, query, lessonId]);
  const lessons = useMemo(() => byLesson(all).map((group) => group.lesson), [all]);
  const code = course?.level.code ?? slug.toUpperCase();

  const hero = <PageHero compact eyebrow={`${code} · Words`} icon={FiBookOpen} title="Wortschatz · Word list" art="courses"
    description={all.length ? `${all.length} words from your lessons. Search in German or English, and tap the speaker to hear a word.` : 'The words of every lesson, with English, examples and audio.'}
    actions={<Link to={`/courses/${slug.toLowerCase()}/learn`} className={heroGhost}><FiArrowLeft aria-hidden />{code} course map</Link>} />;
  if (courses.loading || words.loading) return <div className="space-y-4">{hero}<LoadingBlock label="Loading the word list…" /></div>;
  if (course?.paymentRequired) return <div className="space-y-4">{hero}<Panel><EmptyBlock title="Course locked" hint="The word list opens with the lessons, once this course is paid." /></Panel></div>;
  if (courses.error || words.error) return <div className="space-y-4">{hero}<ErrorBlock message={courses.error ?? words.error ?? 'Could not load the word list.'} onRetry={words.refetch} /></div>;
  return (
    <div className="space-y-4">
      {hero}
      <Panel>
        <div className="flex flex-wrap items-center gap-2">
          <SearchField value={query} onChange={setQuery} ariaLabel="Search words" placeholder="Search German or English…" className="w-full sm:w-72" />
          <select aria-label="Lesson" value={lessonId} onChange={(event) => setLessonId(event.currentTarget.value)} className="select select-sm min-w-0 flex-1 rounded-full sm:max-w-sm">
            <option value="">All lessons</option>
            {lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>Lektion {lesson.order} · {lesson.title}</option>)}
          </select>
          <span className="text-xs text-muted">{groups.reduce((sum, group) => sum + group.words.length, 0)} shown</span>
        </div>
        {!all.length ? <div className="mt-4"><EmptyBlock title="No words yet" hint="Words appear here as the lessons of this course get their word lists." /></div>
          : !groups.length ? <div className="mt-4"><EmptyBlock title="No word matches" hint="Try another spelling, or search in English." /></div>
          : groups.map((group) => (
            <section key={group.lesson.id} className="mt-5" aria-label={`Lektion ${group.lesson.order}`}>
              <h2 className="text-sm font-bold">
                <Link to={`/courses/${slug.toLowerCase()}/learn/${group.lesson.id}`} className="hover:underline">Lektion {group.lesson.order} · {group.lesson.title}</Link>
              </h2>
              <ul className="mt-1">{group.words.map((word, index) => <WordRow key={`${group.lesson.id}-${index}`} word={word} />)}</ul>
            </section>
          ))}
      </Panel>
    </div>
  );
}
