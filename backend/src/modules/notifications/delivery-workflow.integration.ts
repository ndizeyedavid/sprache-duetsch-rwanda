import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { dispatchEmailDeliveries } from '../../lib/notification-delivery.js';
import { notifyUsers } from '../../lib/notify.js';
import { prisma } from '../../lib/prisma.js';
const stamp = `delivery-${randomUUID()}`, users: string[] = [];
try {
  for (let i = 0; i < 2; i++) {
    const user = await prisma.user.create({ data: { email: `${stamp}-${i}@test.local`, firstName: 'Fixture', lastName: 'Delivery', passwordHash: 'unused', role: 'STUDENT', status: 'ACTIVE',
      notificationPreferences: { email: true, inApp: false, schedule: true, exam: true, payment: false } } }); users.push(user.id);
  }
  const input = { type: 'SCHEDULE' as const, title: stamp, body: 'Class fixture', eventKey: stamp };
  const first = await Promise.all([notifyUsers([users[0]], input), notifyUsers([users[0]], input)]);
  assert.equal(first.reduce((sum, row) => sum + row.count, 0), 1);
  assert.equal(await prisma.notification.count({ where: { userId: users[0] } }), 0);
  assert.equal((await notifyUsers(users, input)).count, 1, 'Late recipient must get a delivery independently');
  await notifyUsers(users, { ...input, type: 'PAYMENT', eventKey: `${stamp}-payment` });
  assert.equal(await prisma.notificationDelivery.count({ where: { userId: { in: users }, status: 'SKIPPED' } }), 2);
    await dispatchEmailDeliveries(() => Promise.reject(new Error('Fixture provider unavailable')), users);
    const queued = await prisma.notificationDelivery.findMany({ where: { userId: { in: users }, status: 'PENDING' } });
    assert.equal(queued.length, 2); assert.ok(queued.every(row => row.attempts === 1 && row.lastError?.includes('Fixture')));
    await prisma.notificationDelivery.updateMany({ where: { id: { in: queued.map(row => row.id) } }, data: { nextAttemptAt: new Date() } });
    let delivered = 0;
    await dispatchEmailDeliveries(() => { delivered++; return Promise.resolve(); }, users);
    assert.equal(delivered, 2); assert.equal(await prisma.notificationDelivery.count({ where: { userId: { in: users }, status: 'SENT' } }), 2);
  process.stdout.write('Delivery integration passed: email-only dedupe, concurrent jobs, late recipients, topic opt-outs, durable failures and retries without sending real mail.\n');
} finally {
  await prisma.notificationDelivery.deleteMany({ where: { userId: { in: users } } });
  await prisma.user.deleteMany({ where: { id: { in: users } } });
  await prisma.$disconnect();
}
