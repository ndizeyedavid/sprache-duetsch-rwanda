import { sessionStatusLabel } from '../../../lib/sessions-ui';

type Timed = { status: string; endAt: string };

export const isClosed = (s: Timed) => ['COMPLETED', 'CANCELLED'].includes(s.status) || Date.parse(s.endAt) <= Date.now();

/** "Ended" for a past class that was never marked completed; otherwise the stored status. */
export const statusText = (s: Timed) => (Date.parse(s.endAt) <= Date.now() && !['COMPLETED', 'CANCELLED'].includes(s.status) ? 'Ended' : sessionStatusLabel(s.status));

export const modeText = (mode: string, provider: string | null) =>
  `${mode === 'ONSITE' ? 'On site' : mode === 'HYBRID' ? 'Hybrid' : 'Online'}${provider && mode !== 'ONSITE' ? ` · ${provider.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}` : ''}`;

/** A student may join while the class is open and nothing (e.g. unpaid fees) blocks access. */
export const canJoinSession = (s: Timed & { accessMessage?: string | null }) =>
  !s.accessMessage && !['CANCELLED', 'COMPLETED'].includes(s.status) && Date.parse(s.endAt) > Date.now();
