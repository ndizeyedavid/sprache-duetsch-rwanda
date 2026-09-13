import { useState } from 'react';
import { FiMic, FiMonitor, FiPower, FiUsers, FiVideo } from 'react-icons/fi';
import { Panel } from '../../components/ui/Panel';
import { AvatarGroup } from '../../components/ui/AvatarGroup';
import { ChatBubble } from '../../components/ui/ChatBubble';
import { KebabMenu } from '../../components/ui/KebabMenu';
import { LessonAccordion } from '../../components/ui/LessonAccordion';
import { MessageComposer } from '../../components/ui/MessageComposer';
import { liveChat, liveClass, liveClassContent } from '../../data/mock';

export function AdminLiveClass() {
  const [openGroup, setOpenGroup] = useState<string | null>(liveClassContent[0]?.id ?? null);

  return (
    <div className="grid gap-5 xl:grid-cols-12">
      <div className="xl:col-span-8">
        <Panel>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="flex items-center gap-2 text-[11px] font-medium text-coral">
                <span className="size-2 rounded-full bg-coral" aria-hidden />
                Live Class
              </span>
              <h1 className="mt-2 text-xl font-semibold sm:text-2xl">{liveClass.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted">
                <span className="flex items-center gap-2">
                  <img
                    src={liveClass.photo}
                    alt={liveClass.teacher}
                    className="size-6 rounded-full object-cover"
                  />
                  {liveClass.teacher}
                </span>
                <span className="flex items-center gap-1.5">
                  <FiUsers aria-hidden />
                  {liveClass.students} Students
                </span>
              </div>
            </div>
            <KebabMenu label="Live class options" />
          </div>

          <div className="relative mt-4 overflow-hidden rounded-box">
            <img
              src={liveClass.thumbnail}
              alt={`Live session with ${liveClass.teacher}`}
              className="aspect-video w-full object-cover"
            />
            <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-night/70 px-3 py-1.5 text-[11px] font-medium text-white">
              <span className="size-2 rounded-full bg-coral" aria-hidden />
              Recorded
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-medium">Students</p>
              <AvatarGroup
                items={liveClass.attendees.map((src, index) => ({
                  src,
                  alt: `Student ${index + 1}`,
                }))}
                extra={liveClass.extraAttendees}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Toggle microphone"
                className="btn btn-circle btn-sm border-0 bg-base-200 text-ink hover:bg-base-300"
              >
                <FiMic aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Share screen"
                className="btn btn-circle btn-sm border-0 bg-base-200 text-ink hover:bg-base-300"
              >
                <FiMonitor aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Toggle camera"
                className="btn btn-circle btn-sm border-0 bg-base-200 text-ink hover:bg-base-300"
              >
                <FiVideo aria-hidden />
              </button>
              <button
                type="button"
                aria-label="End live class"
                className="btn btn-circle btn-sm border-0 bg-coral text-white hover:bg-coral/90"
              >
                <FiPower aria-hidden />
              </button>
            </div>
          </div>
        </Panel>
      </div>

      <div className="space-y-5 xl:col-span-4">
        <Panel>
          <h2 className="mb-4 text-base font-semibold">Courses Content</h2>
          <div className="space-y-2">
            {liveClassContent.map((group) => (
              <LessonAccordion
                key={group.id}
                group={group}
                open={openGroup === group.id}
                onToggle={() => setOpenGroup(openGroup === group.id ? null : group.id)}
              />
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Live Chat</h2>
            <KebabMenu label="Live chat options" />
          </div>
          <div className="max-h-72 space-y-4 overflow-y-auto scrollbar-thin pr-1">
            {liveChat.map((message) => (
              <ChatBubble key={message.id} body={message.body} time={message.time} from={message.from} />
            ))}
          </div>
          <MessageComposer placeholder="Type here..." className="mt-4" />
        </Panel>
      </div>
    </div>
  );
}
