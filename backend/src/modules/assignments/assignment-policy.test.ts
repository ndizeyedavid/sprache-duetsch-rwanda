import { describe, expect, it } from "vitest";
import { checkEditable, checkResponse } from "./assignment-policy.js";
import { assignmentBody } from "./assignments.schema.js";
const policy = { dueAt: new Date('2026-01-01'), allowLate: false, maxSubmissions: 2, responseType: 'TEXT' };
describe('homework submission policy', () => {
  it('accepts drafts before the deadline and rejects closed late submissions', () => {
    expect(() => checkEditable(policy, null, new Date('2025-12-31'))).not.toThrow();
    expect(() => checkEditable(policy, null, new Date('2026-01-02'))).toThrow('deadline');
    expect(() => checkEditable({ ...policy, allowLate: true }, null, new Date('2026-01-02'))).not.toThrow();
  });
  it('allows teacher-requested revision but protects submitted and graded work', () => {
    const open = { ...policy, dueAt: null };
    expect(() => checkEditable(open, { status: 'RETURNED', revision: 1 })).not.toThrow();
    for (const status of ['SUBMITTED', 'GRADED']) expect(() => checkEditable(open, { status, revision: 1 })).toThrow('feedback');
    expect(() => checkEditable(open, { status: 'RETURNED', revision: 2 })).toThrow('limit');
  });
  it('requires the response format the teacher selected', () => {
    expect(() => checkResponse('TEXT', '  ', [])).toThrow('answer');
    expect(() => checkResponse('FILE', '', [])).toThrow('Attach');
    expect(() => checkResponse('AUDIO', '', [{ mimeType: 'application/pdf' }])).toThrow('audio');
    expect(() => checkResponse('AUDIO', '', [{ mimeType: 'audio/webm' }])).not.toThrow();
    expect(() => checkResponse('MIXED', 'Hallo', [])).not.toThrow();
  });
  it('requires sensible scheduling, safe resource links and a complete rubric total', () => {
    const base = { classGroupId: '6e30d36e-42a5-4cca-a5bd-2c3b9c0d7280', title: 'Writing task', instructions: 'Write a short introduction.' };
    expect(assignmentBody.safeParse(base).success).toBe(true);
    expect(assignmentBody.safeParse({ ...base, resources: [{ title: 'Bad', url: 'javascript:alert(1)' }] }).success).toBe(false);
    expect(assignmentBody.safeParse({ ...base, releaseAt: '2026-02-01T00:00:00Z', dueAt: '2026-01-01T00:00:00Z' }).success).toBe(false);
    expect(assignmentBody.safeParse({ ...base, rubric: [{ title: 'Grammar', points: 5 }] }).success).toBe(false);
  });
});
