import { FiCheckCircle,FiClock,FiMinusCircle,FiXCircle } from 'react-icons/fi';

export const STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const;
export type AttendanceStatus = (typeof STATUSES)[number];

export const STATUS_META: Record<AttendanceStatus, { label: string; icon: typeof FiCheckCircle; tone: string; chip: string }> = {
  PRESENT: { label: 'Present', icon: FiCheckCircle, tone: 'brand', chip: 'bg-brand text-white border-brand' },
  ABSENT: { label: 'Absent', icon: FiXCircle, tone: 'coral', chip: 'bg-coral text-white border-coral' },
  LATE: { label: 'Late', icon: FiClock, tone: 'sun', chip: 'bg-sun text-[#8A6800] border-sun' },
  EXCUSED: { label: 'Excused', icon: FiMinusCircle, tone: 'muted', chip: 'bg-night text-white border-night' },
};

export const STATUS_CHIP_CLASS: Record<string, string> = {
  PRESENT: 'bg-brand text-primary-content text-[#B30A00] border-brand',
  ABSENT: 'bg-coral text-error-content text-[#D8482F] border-coral',
  LATE: 'bg-sun text-warning-content text-[#8A6800] border-sun',
  EXCUSED: 'bg-night/5 text-night border-night',
};
