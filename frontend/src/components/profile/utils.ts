import type { IconType } from 'react-icons';
import { FiAward,FiBookOpen,FiCalendar,FiCheckCircle,FiMapPin,FiTarget } from 'react-icons/fi';
import type { MyProfile,MyProgressLevel,SkillStat } from '../../lib/services';
import { money } from '../../lib/services';
import type { Tone } from '../../types';
import type { AttendanceSliceKey } from './constants';
import { ATTENDANCE_SLICES,ATTENDANCE_TARGET } from './constants';

export function clampPercent(value: number | null | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export type Tally = { done: number; total: number };

export function moduleTally(module: MyProgressLevel['modules'][number]): Tally {
  return { done: module.lessons.filter((lesson) => lesson.status === 'COMPLETED').length, total: module.lessons.length };
}

export function levelTally(level: MyProgressLevel): Tally {
  return level.modules.reduce<Tally>(
    (sum, module) => {
      const tally = moduleTally(module);
      return { done: sum.done + tally.done, total: sum.total + tally.total };
    },
    { done: 0, total: 0 },
  );
}

export function moduleState(tally: Tally): 'Complete' | 'In Progress' | 'No Progress' {
  if (!tally.total) return 'No Progress';
  if (tally.done === tally.total) return 'Complete';
  return tally.done > 0 ? 'In Progress' : 'No Progress';
}

export type ResumeTarget = { id: string; title: string; moduleTitle: string; coursePath: string } | null;

/** First unfinished lesson of a level — the profile's one "resume" affordance. */
export function resumeTarget(level: MyProgressLevel): ResumeTarget {
  const modules = [...level.modules].sort((a, b) => a.order - b.order);
  for (const module of modules) {
    const lesson = [...module.lessons].sort((a, b) => a.order - b.order).find((item) => item.status !== 'COMPLETED');
    if (lesson) {
      return {
        id: lesson.id,
        title: lesson.title,
        moduleTitle: module.title,
        coursePath: `/courses/${level.level.code.toLowerCase()}/learn/${lesson.id}`,
      };
    }
  }
  return null;
}

/** Weakest first: the order a learner can actually act on. */
export function weakestFirst(skills: SkillStat[]): SkillStat[] {
  return [...skills].sort((a, b) => a.percentage - b.percentage);
}

export type RecordRow = { label: string; value: string; icon: IconType };

export function recordRows(profile: MyProfile): RecordRow[] {
  return [
    { label: 'Campus', value: profile.campus?.name ?? 'Not assigned', icon: FiMapPin },
    { label: 'Intake', value: profile.intake?.name ?? 'Not assigned', icon: FiCalendar },
    {
      label: 'Current level',
      value: profile.currentLevel ? `${profile.currentLevel.code} · ${profile.currentLevel.title}` : 'Not enrolled',
      icon: FiBookOpen,
    },
    {
      label: 'Intended level',
      value: profile.intendedLevel ? `${profile.intendedLevel.code} · ${profile.intendedLevel.levelLabel}` : 'Not selected',
      icon: FiTarget,
    },
  ];
}

export function statTiles(profile: MyProfile): { key: string; label: string; value: string; hint: string; icon: IconType; tone: Tone }[] {
  const { attendance } = profile;
  const attended = attendance.present + attendance.late;
  return [
    {
      key: 'lessons',
      label: 'Lessons completed',
      value: String(profile.lessonsCompleted),
      hint: 'Across every enrolled course',
      icon: FiBookOpen,
      tone: 'navy',
    },
    {
      key: 'attendance',
      label: 'Attendance',
      value: attendance.total ? `${attendance.percentage}%` : '—',
      hint: attendance.total ? `${attended} of ${attendance.total} classes attended` : 'No classes marked yet',
      icon: FiCheckCircle,
      tone: attendanceTone(attendance),
    },
    {
      key: 'certificates',
      label: 'Certificates',
      value: String(profile.certificates),
      hint: 'Each one carries a public verification code',
      icon: FiAward,
      tone: 'brand',
    },
  ];
}

export type Standing = { tone: Tone; label: string; low: boolean };

export function attendanceTone(attendance: MyProfile['attendance']): Tone {
  return attendanceStanding(attendance).tone;
}

export function attendanceStanding(attendance: MyProfile['attendance']): Standing {
  if (!attendance.total) return { tone: 'muted', label: 'No data', low: false };
  if (attendance.percentage >= ATTENDANCE_TARGET) return { tone: 'brand', label: 'On track', low: false };
  if (attendance.percentage >= 60) return { tone: 'sun', label: 'Watch it', low: true };
  return { tone: 'coral', label: 'At risk', low: true };
}

export type AttendanceBar = { key: AttendanceSliceKey; label: string; bar: string; value: number; share: number }[];

export function attendanceBar(attendance: MyProfile['attendance']): AttendanceBar {
  const recorded = ATTENDANCE_SLICES.reduce((sum, slice) => sum + attendance[slice.key], 0);
  return ATTENDANCE_SLICES.map((slice) => ({
    key: slice.key,
    label: slice.label,
    bar: slice.bar,
    value: attendance[slice.key],
    share: recorded ? (attendance[slice.key] / recorded) * 100 : 0,
  }));
}

export type MoneySummary = { due: number; paid: number; balance: number; paidShare: number };

export function moneySummary(finance: MyProfile['finance']): MoneySummary {
  const due = money(finance?.totalDue ?? 0);
  const paid = money(finance?.totalPaid ?? 0);
  const balance = money(finance?.balance ?? 0);
  const paidShare = due > 0 ? clampPercent((paid / due) * 100) : balance <= 0 ? 100 : 0;
  return { due, paid, balance, paidShare };
}



