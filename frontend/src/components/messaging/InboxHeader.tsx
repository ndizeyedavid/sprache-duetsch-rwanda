import { Link } from 'react-router-dom';
import { FiBell,FiEdit3,FiMessageCircle } from 'react-icons/fi';
import { communityLinks } from '../activity/community-links';
import { heroAction,heroGhost } from '../hero/hero-actions';
import { PageHero } from '../hero/PageHero';
import { useSession } from '../../lib/session';
import type { Tab } from './constants';

type Props = { tab: Tab; onTab: (t: Tab) => void; unreadChats: number; unreadNotices: number; totalChats: number; totalNotices: number; onCompose: () => void; className?: string };

const VIEWS = [
  { name: 'Chats', label: 'Conversations', Icon: FiMessageCircle },
  { name: 'Notices', label: 'Class updates', Icon: FiBell },
] as const;

/** Compact red hero for the inbox: new message, Conversations / Class updates switch, related pages. */
export function InboxHeader({ tab, onTab, unreadChats, unreadNotices, totalChats, onCompose, className = '' }: Props) {
  const { user } = useSession();
  const counts: Record<Tab, number> = { Chats: unreadChats, Notices: unreadNotices };
  return (
    <PageHero compact eyebrow="Your learning community" icon={FiMessageCircle} title="Messages" art="messages" className={className}
      description={`Ask a question, share an idea, or catch up on class updates.${totalChats ? ` ${totalChats} ${totalChats === 1 ? 'conversation' : 'conversations'} so far.` : ''}`}
      actions={<>
        <button type="button" onClick={onCompose} className={heroAction}><FiEdit3 aria-hidden />New message</button>
        <div role="group" aria-label="Inbox view" className="flex rounded-full border border-primary-content p-0.5">
          {VIEWS.map(({ name, label, Icon }) => {
            const active = tab === name;
            return (
              <button key={name} type="button" onClick={() => onTab(name)} aria-pressed={active}
                className={`inline-flex min-h-7 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors ${active ? 'bg-primary-content text-primary' : 'text-primary-content hover:bg-primary-content hover:text-primary'}`}>
                <Icon aria-hidden />{label}
                {counts[name] > 0 ? <span className={`rounded-full px-1.5 text-[0.625rem] ${active ? 'bg-primary text-primary-content' : 'bg-primary-content text-primary'}`}>{counts[name]}</span> : null}
              </button>
            );
          })}
        </div>
        {communityLinks(user?.role, 'messages').map(link => <Link key={link.to} to={link.to} className={`${heroGhost} hidden sm:inline-flex`}>{link.label}</Link>)}
      </>} />
  );
}
