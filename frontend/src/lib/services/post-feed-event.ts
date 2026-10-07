import { apiPost } from '.././api';
import type { FeedEvent } from './feed-event';
export function postFeedEvent(body: { type: string; title: string; body?: string }): Promise<FeedEvent> {
  return apiPost<FeedEvent>('/activity/events', body);
}
