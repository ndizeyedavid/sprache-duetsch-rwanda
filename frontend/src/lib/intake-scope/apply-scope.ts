import type { InternalAxiosRequestConfig } from 'axios';
import { getIntakeScope } from './store';
import { isScopedPath } from './scoped-paths';

/**
 * Axios request hook: staff GETs to intake-aware endpoints get `intakeId`
 * appended, unless the caller already chose one explicitly. A single student's
 * record (`studentId=`) always shows that learner's full history across intakes.
 */
export function applyIntakeScope(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const intakeId = getIntakeScope();
  if (!intakeId || (config.method ?? 'get').toLowerCase() !== 'get') return config;
  const url = config.url ?? '';
  const [path, query = ''] = url.split('?');
  if (!isScopedPath(path)) return config;
  const params = (config.params ?? {}) as Record<string, unknown>;
  const search = new URLSearchParams(query);
  if ('intakeId' in params || search.has('intakeId')) return config;
  if ('studentId' in params || search.has('studentId')) return config;
  config.params = { ...params, intakeId };
  return config;
}
