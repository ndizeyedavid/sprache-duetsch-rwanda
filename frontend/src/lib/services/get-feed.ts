import { apiGet } from '.././api';
import type { FeedEvent } from './feed-event';
export function getFeed(type?: string): Promise<FeedEvent[]> {
  const query = type ? `?type=${type}&pageSize=50` : '?pageSize=50';
  return apiGet<FeedEvent[]>(`/activity/feed${query}`);
}
