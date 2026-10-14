import type { LessonActivity } from '../../../lib/services';
import { ActivityPreviewPane } from '../activity-editors/ActivityPreviewPane';
import { activityConfig,editorType,practiceKinds } from './practice-draft';

/** Lesson preview card: the real student player with local answers. */
export function PracticePreview({ activity }: { activity: LessonActivity }) {
  const kind = practiceKinds.find(item => item.type === editorType(activity.type, activity));
  return <article className="rounded-box bg-base-200 p-5">
    <p className="text-xs text-muted">{kind?.label ?? 'Practice activity'}</p><h3 className="mt-1 text-base font-semibold">{activity.title}</h3>
    {activity.instructions ? <p className="mt-2 text-sm text-muted">{activity.instructions}</p> : null}
    <div className="mt-4"><ActivityPreviewPane id={activity.id} type={activity.type} config={activityConfig(activity)} /></div>
  </article>;
}
