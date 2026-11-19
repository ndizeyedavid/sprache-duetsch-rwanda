import { FiMail,FiMessageCircle,FiPhone } from 'react-icons/fi';
import { whatsappNumber } from './utils';

/** One-tap contact: call, WhatsApp (how most applicants answer) and email. */
export function ContactLinks({ phone, email, compact = false }: { phone: string | null; email: string; compact?: boolean }) {
  const wa = whatsappNumber(phone);
  const style = compact ? 'btn btn-ghost btn-xs btn-circle' : 'btn btn-sm gap-1.5 rounded-full border-line bg-base-200 text-xs';
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {phone ? <a href={`tel:${phone}`} className={style} aria-label={`Call ${phone}`} title={`Call ${phone}`}><FiPhone aria-hidden />{compact ? null : 'Call'}</a> : null}
      {wa ? <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className={style} aria-label="WhatsApp" title="WhatsApp"><FiMessageCircle aria-hidden />{compact ? null : 'WhatsApp'}</a> : null}
      <a href={`mailto:${email}`} className={style} aria-label={`Email ${email}`} title={email}><FiMail aria-hidden />{compact ? null : 'Email'}</a>
    </span>
  );
}
