import type { LiveClassStatus, Tone } from '../types';

export function sessionStatusLabel(status: string): LiveClassStatus {
  switch (status) {
    case 'LIVE':
      return 'Live';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    case 'RESCHEDULED':
      return 'Rescheduled';
    default:
      return 'Scheduled';
  }
}

export function sessionTone(status: string): Tone {
  switch (status) {
    case 'LIVE':
      return 'coral';
    case 'COMPLETED':
      return 'brand';
    case 'CANCELLED':
      return 'muted';
    case 'RESCHEDULED':
      return 'sun';
    default:
      return 'navy';
  }
}

export function teacherName(teacher: { firstName: string; lastName: string } | null): string {
  if (!teacher) return 'TBA';
  return `${teacher.firstName} ${teacher.lastName}`.trim() || 'TBA';
}
