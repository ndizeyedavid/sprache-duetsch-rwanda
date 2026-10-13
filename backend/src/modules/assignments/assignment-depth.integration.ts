// Run against the seeded local development database (cleans up after itself):
// NODE_ENV=test LOG_LEVEL=silent UNPAID_ACCESS=FULL node --import tsx src/modules/assignments/assignment-depth.integration.ts
import assert from 'node:assert/strict';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import request from 'supertest';
import { createApp } from '../../app.js';
import { prisma } from '../../lib/prisma.js';
const app = createApp(), ids: string[] = [], submissionIds: string[] = [], bankIds: string[] = [], files: string[] = [];
const stamp = `depth-${Date.now()}`;
const auth = async (email: string, password: string): Promise<string> => {
  const r = await request(app).post('/api/auth/login').send({ email, password }); assert.equal(r.status, 200);
  return `Bearer ${String((r.body as { data: { tokens: { accessToken: string } } }).data.tokens.accessToken)}`;
};
type Data<T> = { body: { data: T } };
const data = <T>(r: unknown): T => (r as Data<T>).body.data;
try {
  const teacher = await auth('clarisse@sparch.rw', 'Teacher123!'), student = await auth('nella@student.sparch.rw', 'Student123!'), academic = await auth('academic@sparch.rw', 'Academic123!');
  const owner = await prisma.user.findUniqueOrThrow({ where: { email: 'clarisse@sparch.rw' } });
  const learner = await prisma.student.findUniqueOrThrow({ where: { userId: (await prisma.user.findUniqueOrThrow({ where: { email: 'nella@student.sparch.rw' } })).id } });
  const enrollment = await prisma.enrollment.findFirstOrThrow({ where: { studentId: learner.id, status: 'ACTIVE', classGroup: { teacherId: owner.id } }, include: { classGroup: true } });
  const classGroupId = enrollment.classGroupId!, levelId = enrollment.classGroup!.levelId;
  const lesson = await prisma.lesson.findFirstOrThrow({ where: { module: { levelId } } });
  const foreignLesson = await prisma.lesson.findFirstOrThrow({ where: { module: { levelId: { not: levelId } } } });
  const outsider = await prisma.student.findFirst({ where: { id: { not: learner.id }, enrollments: { none: { classGroupId } } } });

  // Lesson link: only lessons from the class's level, listed by the class lesson endpoint.
  const lessons = data<{ id: string }[]>(await request(app).get(`/api/assignments/classes/${classGroupId}/lessons`).set('Authorization', teacher).expect(200));
  assert.ok(lessons.some(l => l.id === lesson.id)); assert.ok(!lessons.some(l => l.id === foreignLesson.id));
  const input = { classGroupId, title: stamp, instructions: 'Write five sentences about your weekend.', status: 'PUBLISHED', responseType: 'TEXT', maxPoints: 10,
    gracePeriodMinutes: 30, latePenaltyPercentPerDay: 10, latePenaltyMaxPercent: 25, studentIds: [learner.id] };
  await request(app).post('/api/assignments').set('Authorization', teacher).send({ ...input, lessonId: foreignLesson.id }).expect(400);
  const created = data<{ id: string; lessonId: string }>(await request(app).post('/api/assignments').set('Authorization', teacher).send({ ...input, lessonId: lesson.id }).expect(201));
  ids.push(created.id); assert.equal(created.lessonId, lesson.id);
  const forLesson = data<{ id: string; lesson: { title: string } }[]>(await request(app).get(`/api/assignments/my?lessonId=${lesson.id}`).set('Authorization', student).expect(200));
  assert.equal(forLesson.find(a => a.id === created.id)?.lesson.title, lesson.title);

  // Extensions: need a deadline, must be later, only for students who receive the task.
  await request(app).put(`/api/assignments/${created.id}/extensions/${learner.id}`).set('Authorization', teacher).send({ dueAt: new Date(Date.now() + 86400000).toISOString() }).expect(400);
  const dueAt = new Date(Date.now() - 3 * 86400000 - 3600000); // 3 days and 1 hour ago
  await prisma.assignment.update({ where: { id: created.id }, data: { dueAt } });
  await request(app).put(`/api/assignments/${created.id}/extensions/${learner.id}`).set('Authorization', teacher).send({ dueAt: new Date(dueAt.getTime() - 60000).toISOString() }).expect(400);
  if (outsider) await request(app).put(`/api/assignments/${created.id}/extensions/${outsider.id}`).set('Authorization', teacher).send({ dueAt: new Date().toISOString() }).expect(400);
  await request(app).put(`/api/assignments/${created.id}/extensions/${learner.id}`).set('Authorization', student).send({ dueAt: new Date().toISOString() }).expect(403);
  const extendedTo = new Date(dueAt.getTime() + 2 * 86400000); // still 1 day and 1 hour ago
  await request(app).put(`/api/assignments/${created.id}/extensions/${learner.id}`).set('Authorization', teacher).send({ dueAt: extendedTo.toISOString(), reason: 'Medical note' }).expect(200);
  const mine = data<{ assignment: { dueAt: string; originalDueAt: string; extension: { reason: string } } }>(await request(app).get(`/api/assignments/my/${created.id}`).set('Authorization', student).expect(200));
  assert.equal(mine.assignment.dueAt, extendedTo.toISOString()); assert.equal(mine.assignment.originalDueAt, dueAt.toISOString()); assert.equal(mine.assignment.extension.reason, 'Medical note');
  assert.ok(await prisma.notification.findFirst({ where: { userId: learner.userId, title: `Extension granted: ${stamp}` } }));

  // Late submission: 2 started days after the extended deadline → 20% (cap 25%).
  const sent = data<{ id: string }>(await request(app).post(`/api/assignments/my/${created.id}/submit`).set('Authorization', student).send({ text: 'Am Wochenende war ich in Musanze.', version: null }).expect(200));
  submissionIds.push(sent.id);
  const version = await prisma.assignmentVersion.findFirstOrThrow({ where: { submissionId: sent.id } });
  assert.equal(version.isLate, true); assert.ok(version.lateByMinutes! >= 24 * 60 + 60);
  const staff = data<{ submissions: { id: string; lateness: { penaltyPercent: number } }[]; extensions: unknown[] }>(await request(app).get(`/api/assignments/${created.id}`).set('Authorization', teacher).expect(200));
  assert.equal(staff.submissions.find(s => s.id === sent.id)?.lateness.penaltyPercent, 20); assert.equal(staff.extensions.length, 1);

  // Audio feedback: teacher upload is signature-checked; only audio by this grader can be attached.
  await request(app).post(`/api/assignments/${created.id}/feedback-audio`).set('Authorization', teacher).attach('file', Buffer.from('not audio at all'), { filename: 'f.webm', contentType: 'audio/webm' }).expect(400);
  await request(app).post(`/api/assignments/${created.id}/feedback-audio`).set('Authorization', student).attach('file', Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0, 0, 0, 0]), { filename: 'f.webm', contentType: 'audio/webm' }).expect(403);
  const audio = data<{ id: string }>(await request(app).post(`/api/assignments/${created.id}/feedback-audio`).set('Authorization', teacher).attach('file', Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0, 0, 0, 0]), { filename: 'feedback.webm', contentType: 'audio/webm' }).expect(201));
  files.push((await prisma.assignmentFile.findUniqueOrThrow({ where: { id: audio.id } })).storageName);
  await request(app).get(`/api/assignments/${created.id}/files/${audio.id}`).set('Authorization', student).expect(404);
  await request(app).post(`/api/assignments/${created.id}/submissions/${sent.id}/review`).set('Authorization', teacher).send({ action: 'GRADE', score: 8, feedback: '' }).expect(400);
  const graded = data<{ score: string; rawScore: string; latePenaltyPercent: string; feedbackAudioFileId: string }>(await request(app).post(`/api/assignments/${created.id}/submissions/${sent.id}/review`).set('Authorization', teacher).send({ action: 'GRADE', score: 8, feedback: '', feedbackAudioFileId: audio.id }).expect(200));
  assert.equal(Number(graded.rawScore), 8); assert.equal(Number(graded.latePenaltyPercent), 20); assert.equal(Number(graded.score), 6.4); assert.equal(graded.feedbackAudioFileId, audio.id);
  const result = data<{ feedbackFiles: { id: string }[] }>(await request(app).get(`/api/assignments/my/${created.id}`).set('Authorization', student).expect(200));
  assert.deepEqual(result.feedbackFiles.map(f => f.id), [audio.id]);
  await request(app).get(`/api/assignments/${created.id}/files/${audio.id}`).set('Authorization', student).expect(200);
  await request(app).get(`/api/assignments/${created.id}/files/${audio.id}`).set('Authorization', academic).expect(200);

  // Waive the penalty with a reason: the raw score is kept and the change is audited.
  await request(app).patch(`/api/assignments/${created.id}/submissions/${sent.id}/penalty`).set('Authorization', teacher).send({ percent: 0, reason: '' }).expect(400);
  const waived = data<{ score: string; rawScore: string }>(await request(app).patch(`/api/assignments/${created.id}/submissions/${sent.id}/penalty`).set('Authorization', teacher).send({ percent: 0, reason: 'Internet outage in Musanze' }).expect(200));
  assert.equal(Number(waived.score), 8); assert.equal(Number(waived.rawScore), 8);
  assert.ok(await prisma.auditLog.findFirst({ where: { entityId: sent.id, action: 'HOMEWORK_LATE_PENALTY_OVERRIDDEN', reason: 'Internet outage in Musanze' } }));
  await request(app).delete(`/api/assignments/${created.id}/extensions/${learner.id}`).set('Authorization', teacher).expect(200);
  await request(app).delete(`/api/assignments/${created.id}/extensions/${learner.id}`).set('Authorization', teacher).expect(404);

  // Rubric bank (own + shared) and comment bank (own only, usage counted).
  const rubric = { title: `${stamp} writing`, criteria: [{ title: 'Grammar', description: 'Verb position', points: 5 }, { title: 'Vocabulary', points: 5 }], isShared: true };
  const template = data<{ id: string; canEdit: boolean }>(await request(app).post('/api/assignments/bank/rubrics').set('Authorization', teacher).send(rubric).expect(201)); bankIds.push(template.id);
  await request(app).post('/api/assignments/bank/rubrics').set('Authorization', student).send(rubric).expect(403);
  const seen = data<{ id: string; canEdit: boolean }[]>(await request(app).get('/api/assignments/bank/rubrics').set('Authorization', academic).expect(200));
  assert.equal(seen.find(t => t.id === template.id)?.canEdit, true);
  const comment = data<{ id: string }>(await request(app).post('/api/assignments/bank/comments').set('Authorization', teacher).send({ text: `${stamp} Gut gemacht!`, category: 'Praise' }).expect(201)); bankIds.push(comment.id);
  await request(app).post(`/api/assignments/bank/comments/${comment.id}/use`).set('Authorization', academic).expect(404);
  assert.equal(data<{ usageCount: number }>(await request(app).post(`/api/assignments/bank/comments/${comment.id}/use`).set('Authorization', teacher).expect(200)).usageCount, 1);
  await request(app).delete(`/api/assignments/bank/rubrics/${template.id}`).set('Authorization', teacher).expect(200);
  await request(app).delete(`/api/assignments/bank/comments/${comment.id}`).set('Authorization', teacher).expect(200);
  process.stdout.write('PASS: lesson links, extensions, late penalties + waiver, audio feedback access, rubric and comment banks.\n');
} finally {
  await prisma.assignment.deleteMany({ where: { id: { in: ids } } });
  await prisma.rubricTemplate.deleteMany({ where: { id: { in: bankIds } } });
  await prisma.feedbackComment.deleteMany({ where: { id: { in: bankIds } } });
  await prisma.notification.deleteMany({ where: { title: { contains: stamp } } });
  await prisma.auditLog.deleteMany({ where: { entityId: { in: [...ids, ...submissionIds, ...bankIds] } } });
  for (const file of files) await unlink(path.resolve('uploads', 'assignments', file)).catch(() => {});
  await prisma.$disconnect();
}
