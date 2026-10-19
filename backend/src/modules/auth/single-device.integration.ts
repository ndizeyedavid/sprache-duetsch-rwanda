import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { createApp } from '../../app.js';
import { hashPassword } from '../../lib/password.js';
import { prisma } from '../../lib/prisma.js';
const stamp = `single-device-${randomUUID()}`, app = createApp(), password = 'Device123!';
const users: string[] = [];
type Tokens = { accessToken: string; refreshToken: string };
const signIn = async (email: string, agent: string): Promise<Tokens> => {
  const r = await request(app).post('/api/auth/login').set('User-Agent', agent).send({ email, password });
  assert.equal(r.status, 200); return (r.body as { data: { tokens: Tokens } }).data.tokens;
};
const me = (token: string) => request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
const refresh = (refreshToken: string) => request(app).post('/api/auth/refresh').send({ refreshToken });
try {
  const passwordHash = await hashPassword(password);
  const campus = await prisma.campus.create({ data: { code: stamp, name: stamp } });
  const studentUser = await prisma.user.create({ data: { email: `${stamp}-student@test.local`, firstName: 'One', lastName: 'Device', role: 'STUDENT', status: 'ACTIVE', passwordHash } }); users.push(studentUser.id);
  await prisma.student.create({ data: { userId: studentUser.id, studentCode: stamp, campusId: campus.id, status: 'ACTIVE' } });
  const teacherUser = await prisma.user.create({ data: { email: `${stamp}-teacher@test.local`, firstName: 'Many', lastName: 'Devices', role: 'TEACHER', status: 'ACTIVE', passwordHash } }); users.push(teacherUser.id);

  // Student: the newest sign-in is the only one that keeps working.
  const phone = await signIn(studentUser.email, 'Mozilla/5.0 (Linux; Android 14) Chrome/130 Mobile Safari/537.36');
  await me(phone.accessToken).expect(200);
  const laptop = await signIn(studentUser.email, 'Mozilla/5.0 (Windows NT 10.0) Firefox/131');
  await me(laptop.accessToken).expect(200);
  const kicked = await me(phone.accessToken).expect(401);
  assert.equal((kicked.body as { error: { code: string } }).error.code, 'SESSION_REPLACED');
  const stale = await refresh(phone.refreshToken).expect(401);
  assert.equal((stale.body as { error: { code: string } }).error.code, 'SESSION_REPLACED');
  const notice = await prisma.notification.findFirst({ where: { userId: studentUser.id, type: 'SYSTEM' }, orderBy: { createdAt: 'desc' } });
  assert.ok(notice && /Firefox on Windows/.test(notice.body), 'previous device is told which device signed in');

  // Refresh rotation keeps the same session alive on the active device.
  const rotated = (await refresh(laptop.refreshToken).expect(200)).body as { data: { tokens: Tokens } };
  await me(rotated.data.tokens.accessToken).expect(200);
  await me(laptop.accessToken).expect(200);
  await refresh(laptop.refreshToken).expect(401);
  assert.equal(await prisma.refreshToken.count({ where: { userId: studentUser.id, revokedAt: null } }), 1);

  // Signing out ends the session for the access token as well.
  await request(app).post('/api/auth/logout').send({ refreshToken: rotated.data.tokens.refreshToken }).expect(200);
  const ended = await me(rotated.data.tokens.accessToken).expect(401);
  assert.equal((ended.body as { error: { code: string } }).error.code, 'UNAUTHORIZED');
  assert.equal((await prisma.user.findUniqueOrThrow({ where: { id: studentUser.id } })).activeSessionId, null);

  // Staff keep multi-device access.
  const first = await signIn(teacherUser.email, 'Chrome/130'), second = await signIn(teacherUser.email, 'Firefox/131');
  await me(first.accessToken).expect(200); await me(second.accessToken).expect(200);
  await refresh(first.refreshToken).expect(200);
} finally {
  await prisma.notification.deleteMany({ where: { userId: { in: users } } });
  await prisma.auditLog.deleteMany({ where: { actorId: { in: users } } }).catch(() => undefined);
  await prisma.user.deleteMany({ where: { id: { in: users } } });
  await prisma.campus.deleteMany({ where: { code: stamp } });
  await prisma.$disconnect();
}
