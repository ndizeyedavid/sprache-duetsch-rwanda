// NODE_ENV=test LOG_LEVEL=silent UNPAID_ACCESS=FULL node --import tsx src/modules/assessments/authored-questions.integration.ts
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { createApp } from '../../app.js';
import { prisma } from '../../lib/prisma.js';
const app = createApp(), ids: string[] = [], questionIds: string[] = [], attemptIds: string[] = [];
const stamp = `authored-assessment-${Date.now()}`;
const auth = async (email: string, password: string): Promise<string> => {
  const r = await request(app).post('/api/auth/login').send({ email, password }); assert.equal(r.status, 200);
  return `Bearer ${String((r.body as { data: { tokens: { accessToken: string } } }).data.tokens.accessToken)}`;
};
type Detail = { questions: { questionId: string; question: { prompt: string; correctAnswer?: unknown } }[] };
try {
  const teacher = await auth('clarisse@sparch.rw', 'Teacher123!'), student = await auth('nella@student.sparch.rw', 'Student123!');
  const owner = await prisma.user.findUniqueOrThrow({ where: { email: 'clarisse@sparch.rw' } });
  const learner = await prisma.student.findUniqueOrThrow({ where: { userId: (await prisma.user.findUniqueOrThrow({ where: { email: 'nella@student.sparch.rw' } })).id } });
  const enrollment = await prisma.enrollment.findFirstOrThrow({ where: { studentId: learner.id, status: 'ACTIVE', classGroup: { teacherId: owner.id } } });
  const single = { id: randomUUID(), type: 'SINGLE_CHOICE', prompt: stamp, points: 2, options: ['Hallo', 'Tschüss'], correctAnswer: 'Hallo' };
  const multiple = { id: randomUUID(), type: 'MULTIPLE_CHOICE', prompt: `${stamp} choose greetings`, points: 3, options: ['Hallo', 'Guten Morgen', 'Danke'], correctAnswer: ['Hallo', 'Guten Morgen'] };
  const input = { levelId: enrollment.levelId, title: stamp, type: 'QUIZ', isPublished: true, authoredQuestions: [single, multiple] };
  await request(app).post('/api/assessments/assessments').set('Authorization', teacher).send({ ...input, authoredQuestions: [{ ...single, correctAnswer: null }] }).expect(400);
  const created = await request(app).post('/api/assessments/assessments').set('Authorization', teacher).send(input).expect(201);
  const id = String((created.body as { data: { id: string } }).data.id); ids.push(id);
  const full = await request(app).get(`/api/assessments/assessments/${id}`).set('Authorization', teacher).expect(200);
  const questions = (full.body as { data: Detail }).data.questions; questionIds.push(...questions.map(q => q.questionId)); assert.equal(questions.length, 2);
  const publicDetail = await request(app).get(`/api/assessments/my/assessments/${id}`).set('Authorization', student).expect(200);
  assert.equal((publicDetail.body as { data: Detail }).data.questions[0].question.correctAnswer, undefined);
  const begun = await request(app).post(`/api/assessments/my/assessments/${id}/attempts`).set('Authorization', student).send({}).expect(201);
  const attemptId = String((begun.body as { data: { id: string } }).data.id); attemptIds.push(attemptId);
  const updated = await request(app).patch(`/api/assessments/assessments/${id}`).set('Authorization', teacher).send({ title: `${stamp} revised`, authoredQuestions: [{ ...single, prompt: `${stamp} new prompt` }, multiple] }).expect(200);
  assert.equal(updated.status, 200);
  const newer = await request(app).get(`/api/assessments/assessments/${id}`).set('Authorization', teacher).expect(200);
  questionIds.push(...(newer.body as { data: Detail }).data.questions.map(q => q.questionId));
  const submitted = await request(app).post(`/api/assessments/my/attempts/${attemptId}/submit`).set('Authorization', student).send({ answers: [{ questionId: questions[0].questionId, response: 'Hallo' }, { questionId: questions[1].questionId, response: ['Hallo', 'Guten Morgen'] }] }).expect(200);
  assert.equal(Number((submitted.body as { data: { score: number } }).data.score), 5);
  assert.equal((await prisma.answer.findMany({ where: { attemptId } })).length, 2);
  process.stdout.write('PASS: direct assessment authoring, single/multiple-choice marking, hidden keys, atomic editing and active attempt snapshots.\n');
} finally {
  await prisma.attempt.deleteMany({ where: { id: { in: attemptIds } } });
  await prisma.assessment.deleteMany({ where: { id: { in: ids } } });
  await prisma.question.deleteMany({ where: { id: { in: questionIds } } });
  await prisma.auditLog.deleteMany({ where: { entityId: { in: [...ids, ...attemptIds] } } });
  await prisma.$disconnect();
}
