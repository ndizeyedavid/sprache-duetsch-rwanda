import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { unlink,writeFile } from 'node:fs/promises';
import path from 'node:path';
import request from 'supertest';
import { createApp } from '../../app.js';
import { signAccessToken } from '../../lib/jwt.js';
import { prisma } from '../../lib/prisma.js';
import { gradeAttempt,startAttempt,submitAttempt } from '../assessments/assessments.service.js';
import { checkEligibility,renderCertificatePdf,issueCertificate,reissueCertificate,revokeCertificate } from '../certificates/certificates.service.js';
import { UPLOAD_DIR } from '../uploads/uploads.service.js';
import { getStudentLesson,upsertLessonProgress } from './content.service.js';
const stamp = `learning-${randomUUID()}`, app = createApp();
const users: string[] = [], students: string[] = [], assessmentIds: string[] = [], groupIds: string[] = [];
let campusId: string | undefined, levelId: string | undefined, intakeId: string | undefined;
const name = `${stamp}.pdf`;
try {
  const campus = await prisma.campus.create({ data: { code: stamp, name: stamp } }); campusId = campus.id;
  const level = await prisma.level.create({ data: { code: stamp, title: stamp, levelLabel: 'A1' } }); levelId = level.id;
  const intake = await prisma.intake.create({ data: { code: stamp, name: stamp, startDate: new Date(), endDate: new Date(Date.now() + 86400000) } }); intakeId = intake.id;
  for (let i = 0; i < 2; i++) {
    const user = await prisma.user.create({ data: { email: `${stamp}-${i}@test.local`, firstName: 'Fixture', lastName: 'Student', role: 'STUDENT', status: 'ACTIVE', passwordHash: 'unused' } }); users.push(user.id);
    const student = await prisma.student.create({ data: { userId: user.id, studentCode: `${stamp}-${i}`, campusId: campus.id, currentLevelId: level.id, status: 'ACTIVE' } }); students.push(student.id);
  }
  const enrollment = await prisma.enrollment.create({ data: { studentId: students[0], levelId: level.id, intakeId: intake.id, campusId: campus.id, totalFee: 0 } });
  const module = await prisma.module.create({ data: { levelId: level.id, title: stamp, order: 0, isPublished: true } });
  const lesson = await prisma.lesson.create({ data: { moduleId: module.id, title: stamp, order: 0, isPublished: true } });
  const activity = await prisma.activity.create({ data: { lessonId: lesson.id, title: stamp, type: 'FILL_BLANK', isPublished: true, config: { answer: 'Hallo', items: [{ id: 'one', answer: 'Hallo' }] } } });
  const detail = await getStudentLesson(users[0], lesson.id);
  const config = detail.activities.find(row => row.id === activity.id)!.config as Record<string, unknown>;
  assert.equal(config.answer, undefined); assert.equal(JSON.stringify(config).includes('Hallo'), false);
  await assert.rejects(getStudentLesson(users[1], lesson.id), /access/);
  await prisma.lesson.update({ where: { id: lesson.id }, data: { releaseAt: new Date(Date.now() + 86400000) } });
  await assert.rejects(upsertLessonProgress(users[0], lesson.id, { status: 'COMPLETED' }), /available/);
  await prisma.lesson.update({ where: { id: lesson.id }, data: { releaseAt: null } });
  await prisma.module.update({ where: { id: module.id }, data: { isPublished: false } });
  await assert.rejects(upsertLessonProgress(users[0], lesson.id, { status: 'COMPLETED' }), /available/);
  await prisma.module.update({ where: { id: module.id }, data: { isPublished: true } });
  await writeFile(path.join(UPLOAD_DIR, name), '%PDF-1.4\nfixture');
  await prisma.lessonMaterial.create({ data: { lessonId: lesson.id, title: 'Fixture PDF', type: 'PDF', url: `/api/uploads/${name}`, mimeType: 'application/pdf' } });
  const headers = users.map(id => `Bearer ${signAccessToken(id, 'fixture@test.local', 'STUDENT')}`);
  await request(app).get(`/api/uploads/${name}`).expect(401);
  await request(app).get(`/api/uploads/${name}`).set('Authorization', headers[0]).expect(200);
  await request(app).get(`/api/uploads/${name}`).set('Authorization', headers[1]).expect(403);
  const question = await prisma.question.create({ data: { levelId: level.id, type: 'SINGLE_CHOICE', prompt: 'Hello?', options: ['Hallo', 'Danke'], correctAnswer: 'Hallo', points: 2 } });
  const exam = await prisma.assessment.create({ data: { levelId: level.id, title: stamp, type: 'FINAL_EXAM', isPublished: true, maxAttempts: 1,
    questions: { create: { questionId: question.id, order: 0 } } } }); assessmentIds.push(exam.id);
  const starts = await Promise.all([startAttempt(users[0], exam.id), startAttempt(users[0], exam.id)]);
  assert.equal(starts[0].id, starts[1].id); assert.equal(JSON.stringify(starts).includes('correctAnswer'), false);
  await prisma.question.update({ where: { id: question.id }, data: { correctAnswer: 'Danke', points: 10 } });
  const submissions = await Promise.allSettled([submitAttempt(users[0], starts[0].id, { answers: [{ questionId: question.id, response: 'Hallo' }] }), submitAttempt(users[0], starts[0].id, { answers: [{ questionId: question.id, response: 'Hallo' }] })]);
  assert.equal(submissions.filter(row => row.status === 'fulfilled').length, 1);
  const graded = await prisma.attempt.findUniqueOrThrow({ where: { id: starts[0].id } }); assert.equal(graded.score?.toString(), '2');
  const answer = await prisma.answer.findFirstOrThrow({ where: { attemptId: graded.id } });
  await assert.rejects(gradeAttempt(graded.id, { answers: [{ answerId: answer.id, pointsAwarded: 3, feedback: undefined }], feedback: undefined }), /exceeds/);
  await upsertLessonProgress(users[0], lesson.id, { status: 'COMPLETED' });
  assert.equal((await checkEligibility(students[0], level.id)).eligible, true);
  await assert.rejects(issueCertificate({ studentId: students[0], levelId: level.id, enrollmentId: 'unrelated' }), /Enrolment/);
  const certificate = await issueCertificate({ studentId: students[0], levelId: level.id, enrollmentId: enrollment.id });
  await assert.rejects(issueCertificate({ studentId: students[0], levelId: level.id }), /Already issued/);
  assert.equal((await renderCertificatePdf(certificate.id)).subarray(0, 5).toString(), '%PDF-');
  await revokeCertificate(certificate.id, 'Fixture reissue');
  assert.notEqual((await reissueCertificate(certificate.id)).certificateNumber, certificate.certificateNumber);
  await prisma.level.update({ where: { id: level.id }, data: { completionRules: { minimumAttendance: 75, requireHomework: false, homeworkPassMark: 50 } } });
  const ruleResult = await checkEligibility(students[0], level.id); assert.ok(ruleResult.reasons.includes('Attendance requirement not met'));
  process.stdout.write('Learning integration passed: level and file access, answer secrecy, release rules, exam concurrency/snapshots, grading caps and certificate lifecycle.\n');
} finally {
  const related = await Promise.all([
    prisma.payment.findMany({ where: { studentId: { in: students } }, select: { id: true } }),
    prisma.charge.findMany({ where: { studentId: { in: students } }, select: { id: true } }),
    prisma.discount.findMany({ where: { studentId: { in: students } }, select: { id: true } }),
    prisma.enrollment.findMany({ where: { studentId: { in: students } }, select: { id: true } }),
    prisma.attempt.findMany({ where: { studentId: { in: students } }, select: { id: true } }),
    prisma.certificate.findMany({ where: { studentId: { in: students } }, select: { id: true } }),
  ]);
  await prisma.auditLog.deleteMany({ where: { OR: [{ entityId: { in: related.flat().map(row => row.id) } }, { actorId: { in: users } }] } });
  await prisma.activityEvent.deleteMany({ where: { studentId: { in: students } } });
  await unlink(path.join(UPLOAD_DIR, name)).catch(() => {});
  await prisma.certificate.deleteMany({ where: { studentId: { in: students } } });
  await prisma.attempt.deleteMany({ where: { studentId: { in: students } } });
  await prisma.assessment.deleteMany({ where: { id: { in: assessmentIds } } });
  await prisma.student.deleteMany({ where: { id: { in: students } } });
  await prisma.user.deleteMany({ where: { id: { in: users } } });
  await prisma.classGroup.deleteMany({ where: { id: { in: groupIds } } });
  if (intakeId) await prisma.intake.delete({ where: { id: intakeId } });
  if (levelId) { await prisma.question.deleteMany({ where: { levelId } }); await prisma.level.delete({ where: { id: levelId } }); }
  if (campusId) await prisma.campus.delete({ where: { id: campusId } });
  await prisma.$disconnect();
}
