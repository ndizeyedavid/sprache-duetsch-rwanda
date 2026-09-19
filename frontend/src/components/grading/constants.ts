import { FiClock, FiCheckCircle, FiInbox } from 'react-icons/fi';

export const FILTERS = ['SUBMITTED', 'GRADED', 'IN_PROGRESS'] as const;
export type Filter = (typeof FILTERS)[number];

export const FILTER_META: Record<Filter, { label: string; icon: typeof FiInbox; tone: string; desc: string }> = {
  SUBMITTED: { label: 'Needs grading', icon: FiInbox, tone: 'coral', desc: 'Awaiting your review' },
  GRADED: { label: 'Graded', icon: FiCheckCircle, tone: 'brand', desc: 'Already reviewed' },
  IN_PROGRESS: { label: 'In progress', icon: FiClock, tone: 'sun', desc: 'Student is working' },
};

export const VIEWS = ['queue', 'gradebook', 'activities'] as const;
export type View = (typeof VIEWS)[number];
