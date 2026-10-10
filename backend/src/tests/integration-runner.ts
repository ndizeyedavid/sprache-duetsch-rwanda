import { spawnSync } from 'node:child_process';
import { env } from '../config/env.js';
const fixtures = [
  'src/tests/course-photo.integration.ts',
  'src/modules/payments/finance-workflow.integration.ts',
  'src/modules/content/learning-workflow.integration.ts',
  'src/modules/notifications/delivery-workflow.integration.ts',
];
const childEnv = Object.fromEntries(Object.entries({ ...env, NODE_ENV: 'test', LOG_LEVEL: 'silent', REMINDERS_ENABLED: 'false' })
  .filter(([, value]) => value !== undefined).map(([key, value]) => [key, String(value)]));
for (const file of fixtures) {
  const result = spawnSync(process.execPath, ['--import', 'tsx', file], { stdio: 'inherit', env: childEnv });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
