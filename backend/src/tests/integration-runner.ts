import { spawnSync } from 'node:child_process';
import { env } from '../config/env.js';
const fixtures = [
  'src/tests/course-photo.integration.ts',
  'src/modules/auth/single-device.integration.ts',
  'src/modules/payments/finance-workflow.integration.ts',
  'src/modules/content/learning-workflow.integration.ts',
  'src/modules/notifications/delivery-workflow.integration.ts',
  'src/modules/mobile-money/mobile-money-workflow.integration.ts',
];
// The mobile-money workflow talks to an in-memory XendlyPay; these fixture values never reach the real gateway.
const fixtureEnv: Record<string, Record<string, string>> = {
  'src/modules/mobile-money/mobile-money-workflow.integration.ts': {
    XENDLYPAY_ENABLED: 'true', XENDLYPAY_API_KEY: 'xpay_fixture_key', XENDLYPAY_WEBHOOK_SECRET: 'fixture-webhook-secret', XENDLYPAY_MODE: 'test',
  },
};
const childEnv = Object.fromEntries(Object.entries({ ...env, NODE_ENV: 'test', LOG_LEVEL: 'silent', REMINDERS_ENABLED: 'false' })
  .filter(([, value]) => value !== undefined).map(([key, value]) => [key, String(value)]));
for (const file of fixtures) {
  const result = spawnSync(process.execPath, ['--import', 'tsx', file], { stdio: 'inherit', env: { ...childEnv, ...fixtureEnv[file] } });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
