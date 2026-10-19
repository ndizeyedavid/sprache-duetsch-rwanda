import { format } from 'date-fns';
import { currencyAmount } from '../../lib/format';
import type { ClaimStatus } from '../../lib/payment-claims';
import { money,type Money } from '../../lib/services/money';

export const amountLabel = (value: Money, currency: string) => currencyAmount(money(value), currency);
export const dayLabel = (iso: string) => format(new Date(iso), 'd MMM yyyy');

export const STATUS_LABEL: Record<ClaimStatus, string> = { PENDING: 'Waiting for approval', APPROVED: 'Confirmed', REJECTED: 'Not confirmed' };
export const STATUS_CLASS: Record<ClaimStatus, string> = {
  PENDING: 'border border-warning bg-base-100 text-base-content',
  APPROVED: 'bg-success text-success-content',
  REJECTED: 'bg-muted-soft text-muted-ink',
};

/** Methods a student may report themselves; the gateway confirms itself and scholarships are granted by finance. */
export const reportable = (method: { code: string; isActive?: boolean }) => method.isActive !== false && method.code !== 'PAYPACK' && method.code !== 'SCHOLARSHIP';
/** Methods finance can use to mark someone paid by hand (never the gateway). */
export const manualMethod = (method: { code: string; isActive?: boolean }) => method.isActive !== false && method.code !== 'PAYPACK';

/** `yyyy-mm-dd` of today in local time, for date inputs. */
export const todayInput = () => format(new Date(), 'yyyy-MM-dd');
