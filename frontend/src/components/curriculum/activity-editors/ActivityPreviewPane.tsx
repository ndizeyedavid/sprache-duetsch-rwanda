import { useState } from 'react';
import { ActivityPlayer } from '../../activity-player/ActivityPlayer';
import type { ActivityConfig } from '../../activity-player/types';

/** Interactive student view of an activity; answers stay local and are never submitted. */
export function ActivityPreviewPane({ id, type, config }: { id: string; type: string; config: ActivityConfig }) {
  const [value, setValue] = useState<unknown>(null);
  return <ActivityPlayer activityId={`preview-${id}`} type={type} config={config} value={value} onChange={setValue} />;
}
