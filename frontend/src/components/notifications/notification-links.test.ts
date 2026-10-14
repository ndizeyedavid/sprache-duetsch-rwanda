import { describe,expect,it } from 'vitest';
import { notificationLink } from './notification-links';
import { badgeLabel,timeAgo } from './notification-meta';

describe('notificationLink', () => {
  it('sends students to the exact assignment, thread and payment page', () => {
    expect(notificationLink({ type: 'ASSIGNMENT', data: { assignmentId: 'a 1' } }, 'STUDENT')).toBe('/assignments/a%201');
    expect(notificationLink({ type: 'MESSAGE', data: { conversationId: 'c1' } }, 'STUDENT')).toBe('/messages?thread=c1');
    expect(notificationLink({ type: 'PAYMENT', data: null }, 'STUDENT')).toBe('/payments');
    expect(notificationLink({ type: 'CLASS', data: { classGroupId: 'g', percentage: 60 } }, 'STUDENT')).toBe('/attendance');
    expect(notificationLink({ type: 'SCHEDULE', data: { sessionId: 's' } }, 'STUDENT')).toBe('/schedule');
  });

  it('keeps staff links inside their own role group', () => {
    expect(notificationLink({ type: 'MESSAGE', data: { conversationId: 'c1' } }, 'TEACHER')).toBe('/teacher/messages?thread=c1');
    expect(notificationLink({ type: 'MESSAGE', data: {} }, 'FINANCE_ADMIN')).toBe('/admin/messages');
    expect(notificationLink({ type: 'ASSIGNMENT', data: { assignmentId: 'a' } }, 'TEACHER')).toBe('/teacher/assignments');
    expect(notificationLink({ type: 'PAYMENT', data: {} }, 'FINANCE_ADMIN')).toBe('/admin/finance');
  });

  it('never links academic admins to finance or finance admins to academics', () => {
    expect(notificationLink({ type: 'PAYMENT', data: {} }, 'ACADEMIC_ADMIN')).toBeNull();
    expect(notificationLink({ type: 'ASSIGNMENT', data: {} }, 'FINANCE_ADMIN')).toBeNull();
    expect(notificationLink({ type: 'SCHEDULE', data: {} }, 'FINANCE_ADMIN')).toBeNull();
  });

  it('returns null for announcements and unknown types', () => {
    expect(notificationLink({ type: 'ANNOUNCEMENT', data: {} }, 'STUDENT')).toBeNull();
    expect(notificationLink({ type: 'SOMETHING_NEW' }, 'TEACHER')).toBeNull();
  });
});

describe('notification meta helpers', () => {
  it('caps and hides the badge', () => {
    expect(badgeLabel(0)).toBeNull();
    expect(badgeLabel(7)).toBe('7');
    expect(badgeLabel(250)).toBe('99+');
  });

  it('describes recent times', () => {
    const now = new Date('2026-10-11T12:00:00Z');
    expect(timeAgo('2026-10-11T11:59:30Z', now)).toBe('just now');
    expect(timeAgo('2026-10-11T11:55:00Z', now)).toBe('5 minutes ago');
    expect(timeAgo('not a date', now)).toBe('');
  });
});
