import type { ReactNode } from 'react';
import { recordClassJoin } from '../../lib/services/record-class-join';
import { useSession } from '../../lib/session';

/** Leave `sessionId` out for links that are not the live class (e.g. a recording). */
type Props = { sessionId?: string; href: string; className?: string; children: ReactNode };

/**
 * The live-class link. For students, opening it also takes their attendance (the API decides
 * PRESENT/LATE and ignores clicks outside the class window). The request is fired without
 * waiting so the meeting opens instantly; a failure never blocks joining the class.
 */
export function ClassJoinLink({ sessionId, href, className, children }: Props) {
  const { user } = useSession();
  const checkIn = () => {
    if (sessionId && user?.role === 'STUDENT') recordClassJoin(sessionId).catch(() => undefined);
  };
  return (
    <a href={href} target="_blank" rel="noreferrer" onClick={checkIn} onAuxClick={checkIn} className={className}>
      {children}
    </a>
  );
}
