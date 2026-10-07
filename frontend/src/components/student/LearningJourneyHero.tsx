import { FiArrowUpRight,FiCompass,FiMessageCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { MyCourse } from '../../lib/services';

type Props = { firstName?: string; course?: MyCourse };

export function LearningJourneyHero({ firstName, course }: Props) {
  const lessons = course ? [...course.modules].sort((a, b) => a.order - b.order).flatMap((module) => [...module.lessons].sort((a, b) => a.order - b.order)) : [];
  const next = lessons.find((lesson) => lesson.progressStatus === 'IN_PROGRESS')
    ?? lessons.find((lesson) => lesson.progressStatus !== 'COMPLETED');
  const coursePath = course ? `/courses/${course.level.code.toLowerCase()}/learn` : '/courses';

  return (
    <section className="journey-hero card overflow-hidden border border-primary text-primary-content">
      <div className="relative grid items-center gap-5 p-5 sm:p-6 md:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-6">
        <div>
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-primary-content/80">
            <FiCompass aria-hidden /> YOUR LEARNING SPACE
          </p>
          <h2 className="max-w-xl text-3xl font-semibold leading-[1.2] tracking-tight sm:text-3xl xl:text-4xl">
            Hallo{firstName ? `, ${firstName}` : ''}.<br />Ready for your next step?
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-primary-content/85">
            {next ? <>Up next: <strong className="font-semibold text-primary-content">{next.title}</strong>.</>
              : course ? lessons.length ? 'Look how far you’ve come. Revisit a lesson and put your German into practice.' : 'Your teacher is preparing your lessons. Explore your course while you wait for your first chapter.'
                : 'Your learning journey starts with your enrolled courses. Explore your space and get ready for your first lesson.'}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Link to={next ? `${coursePath}/${next.id}` : coursePath} className="btn gap-3 rounded-full border-primary-content bg-primary-content px-6 text-primary shadow-none hover:border-primary-content/90 hover:bg-primary-content/90 focus-visible:outline-primary-content">
              {next ? 'Continue learning' : course ? 'Explore my course' : 'View my courses'} <FiArrowUpRight aria-hidden className="text-lg" />
            </Link>
            {next?.estimatedMinutes ? <span className="text-xs text-primary-content/80">{next.estimatedMinutes} min</span> : null}
          </div>
        </div>
        <div className="relative hidden h-64 items-end justify-center md:flex" aria-hidden="true">
          <img src="/student-hero.webp" alt="" width={1200} height={1058} fetchPriority="high"
            className="relative z-10 h-full w-full object-contain object-bottom" />
          <span className="journey-orbit-label -left-2 top-3 z-20 border-primary/15 text-primary">Hallo! ☀</span>
          <span className="journey-orbit-label -right-2 bottom-3 z-20 flex items-center gap-2 text-base-content"><FiMessageCircle /> Schritt für Schritt</span>
        </div>
      </div>
    </section>
  );
}
