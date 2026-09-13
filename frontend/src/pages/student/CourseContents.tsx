import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiBookmark, FiCalendar, FiShare2 } from 'react-icons/fi';
import { Panel } from '../../components/ui/Panel';
import { TabNav } from '../../components/ui/TabNav';
import { VideoPlayer } from '../../components/ui/VideoPlayer';
import { LessonAccordion } from '../../components/ui/LessonAccordion';
import { KebabMenu } from '../../components/ui/KebabMenu';
import { courses, lessonGroups } from '../../data/mock';

const TABS = ['About', 'Reviews', 'Discussion'];

export function CourseContents() {
  const { slug } = useParams<{ slug: string }>();
  const course = courses.find((item) => item.slug === slug) ?? courses[0];
  const [tab, setTab] = useState(TABS[0]);
  const [openGroup, setOpenGroup] = useState(lessonGroups[0].id);

  return (
    <div className="grid gap-5 xl:grid-cols-12">
      <div className="space-y-5 xl:col-span-8">
        <Panel>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg font-semibold leading-snug sm:text-xl">{course.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
                <span className="font-semibold text-ink">{course.rating.toFixed(1)}</span>
                <span aria-hidden>|</span>
                <span>Review ({course.reviews})</span>
                <span aria-hidden>|</span>
                <span>{course.students} Students</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" className="btn btn-ghost btn-sm btn-circle text-muted" aria-label="Add to calendar">
                <FiCalendar aria-hidden />
              </button>
              <button type="button" className="btn btn-ghost btn-sm btn-circle text-muted" aria-label="Bookmark lesson">
                <FiBookmark aria-hidden />
              </button>
              <button type="button" className="btn btn-ghost btn-sm btn-circle text-muted" aria-label="Share lesson">
                <FiShare2 aria-hidden />
              </button>
            </div>
          </div>

          <VideoPlayer poster={course.thumbnail} alt={`${course.title} Lektion`} label="Lektion starten" />
        </Panel>

        <Panel>
          <TabNav tabs={TABS} active={tab} onChange={setTab} />
          <div className="mt-5">
            {tab === 'About' ? (
              <>
                <h2 className="text-base font-semibold">About Course</h2>
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted">
                  <p>{course.summary}</p>
                  <p>
                    Die Lektionen sind nach Modulen geordnet. Du kannst Notizen und Audio-Dateien herunterladen und
                    später offline wiederholen — ideal für langsame Verbindungen.
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm leading-relaxed text-muted">
                Noch keine {tab.toLowerCase()}-Beiträge. Sobald du eine Lektion abgeschlossen hast, kannst du hier
                Fragen stellen.
              </p>
            )}
          </div>
        </Panel>
      </div>

      <div className="space-y-5 xl:col-span-4">
        <Panel>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Progress</h2>
            <KebabMenu label="Progress options" />
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-base-300" role="progressbar" aria-valuenow={10} aria-valuemin={0} aria-valuemax={110}>
            <div className="h-full w-[9%] rounded-full bg-brand" />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-muted">{course.title}</span>
            <span className="font-medium">10/110</span>
          </div>
        </Panel>

        <div className="space-y-3">
          {lessonGroups.map((group) => (
            <LessonAccordion
              key={group.id}
              group={group}
              open={openGroup === group.id}
              onToggle={() => setOpenGroup(openGroup === group.id ? '' : group.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
