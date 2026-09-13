import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaStar } from 'react-icons/fa6';
import { FiChevronLeft, FiHeart } from 'react-icons/fi';
import { Panel } from '../../components/ui/Panel';
import { TabNav } from '../../components/ui/TabNav';
import { VideoPlayer } from '../../components/ui/VideoPlayer';
import { Rating } from '../../components/ui/Rating';
import { TONE_SURFACE } from '../../lib/status';
import { rwf } from '../../lib/format';
import { courseReviews, courses } from '../../data/mock';

const TABS = ['About', 'Reviews'];

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <FaStar key={index} className={index < value ? 'text-sun' : 'text-base-300'} aria-hidden />
      ))}
    </span>
  );
}

export function CourseOverview() {
  const { slug } = useParams<{ slug: string }>();
  const course = courses.find((item) => item.slug === slug) ?? courses[0];
  const [tab, setTab] = useState(TABS[0]);

  const discount = course.oldPrice
    ? Math.round(((course.oldPrice - course.price) / course.oldPrice) * 100)
    : 0;

  return (
    <div className="grid gap-5 xl:grid-cols-12">
      <Panel className="xl:col-span-8">
        <Link to="/courses" className="mb-5 inline-flex items-center gap-1 text-xs font-medium text-ink">
          <FiChevronLeft aria-hidden />
          Back
        </Link>

        <h1 className="text-xl font-semibold leading-snug sm:text-2xl">{course.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{course.summary}</p>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
          <span className="flex items-center gap-2">
            <span className="font-semibold">{course.rating.toFixed(1)}</span>
            <Stars value={course.rating} />
          </span>
          <span className="text-muted" aria-hidden>
            |
          </span>
          <span className="text-muted">Review ({course.reviews})</span>
          <span className="text-muted" aria-hidden>
            |
          </span>
          <span className="text-muted">{course.students} Students</span>
        </div>

        <div className="mt-4 flex items-center gap-3 border-b border-line pb-5">
          <img src={course.teacher.photo} alt={course.teacher.name} className="size-10 rounded-full object-cover" />
          <span>
            <span className="block text-sm font-medium">{course.teacher.name}</span>
            <span className="block text-[11px] text-muted">Kurslehrer · {course.level}</span>
          </span>
        </div>

        <TabNav tabs={TABS} active={tab} onChange={setTab} className="mt-5" />

        <div className="mt-5">
          {tab === 'About' ? (
            <div className="space-y-4 text-sm leading-relaxed text-muted">
              <p>{course.summary}</p>
              <p>
                Jede Lektion enthält eine kurze Aufnahme, eine Notiz zum Herunterladen und ein Quiz. Fragen stellst du
                direkt in der Live-Klasse oder im Gruppenchat deiner Stufe.
              </p>
            </div>
          ) : (
            <ul className="space-y-5">
              {courseReviews.map((review) => (
                <li key={review.id}>
                  <div className="flex items-center gap-3">
                    <img src={review.photo} alt={review.name} className="size-10 rounded-full object-cover" />
                    <span>
                      <span className="block text-sm font-medium">{review.name}</span>
                      <span className="flex items-center gap-2 text-[11px] text-muted">
                        <Stars value={review.rating} />
                        <span>{review.rating.toFixed(1)}</span>
                        <span aria-hidden>|</span>
                        <span>{review.when}</span>
                      </span>
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{review.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Panel>

      <div className="space-y-5 xl:col-span-4">
        <Panel>
          <VideoPlayer poster={course.thumbnail} alt={`${course.title} Vorschau`} />
          <div className="mt-4 flex items-center gap-3">
            <span className="text-xl font-semibold text-ink">{rwf(course.price)}</span>
            {course.oldPrice ? (
              <span className="text-sm text-muted line-through">{rwf(course.oldPrice)}</span>
            ) : null}
            {discount > 0 ? (
              <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${TONE_SURFACE.coral}`}>
                Save {discount}%
              </span>
            ) : null}
            <button
              type="button"
              className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-medium text-coral"
            >
              <FiHeart aria-hidden />
              Add to Wishlist
            </button>
          </div>
        </Panel>

        <Panel>
          <h2 className="text-base font-semibold">What will you learn:</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {course.outcomes.map((outcome) => (
              <li key={outcome} className="flex items-start gap-2 text-xs leading-snug text-muted">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                {outcome}
              </li>
            ))}
          </ul>
        </Panel>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="btn rounded-full border-line bg-base-100 text-ink shadow-none hover:bg-base-100"
          >
            Add to Cart
          </button>
          <button
            type="button"
            className="btn rounded-full border-0 bg-brand text-white hover:bg-brand/90"
          >
            Buy Now
          </button>
        </div>

        <Panel className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Level</span>
            <span className="text-xs text-muted">
              {course.level} · {course.levelLabel}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Lektionen</span>
            <span className="text-xs text-muted">{course.lessons}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Bewertung</span>
            <Rating value={course.rating} />
          </div>
        </Panel>
      </div>
    </div>
  );
}
