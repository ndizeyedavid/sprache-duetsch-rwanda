import { FiCheckCircle, FiClock, FiMinusCircle, FiXCircle } from 'react-icons/fi';

export const STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const;
export type AttendanceStatus = (typeof STATUSES)[number];

export const STATUS_META: Record<AttendanceStatus, { label: string; icon: typeof FiCheckCircle; tone: string; chip: string }> = {
  PRESENT: { label: 'Present', icon: FiCheckCircle, tone: 'brand', chip: 'bg-brand text-white border-brand' },
  ABSENT: { label: 'Absent', icon: FiXCircle, tone: 'coral', chip: 'bg-coral text-white border-coral' },
  LATE: { label: 'Late', icon: FiClock, tone: 'sun', chip: 'bg-sun text-[#8A6800] border-sun' },
  EXCUSED: { label: 'Excused', icon: FiMinusCircle, tone: 'muted', chip: 'bg-night text-white border-night' },
};

export const STATUS_CHIP_CLASS: Record<string, string> = {
  PRESENT: 'bg-brand-soft text-[#B30A00] border-brand/20',
  ABSENT: 'bg-coral-soft text-[#D8482F] border-coral/20',
  LATE: 'bg-sun-soft text-[#8A6800] border-sun/30',
  EXCUSED: 'bg-night/5 text-night border-night/20',
};
