import { FiArrowUpRight, FiCalendar, FiEdit3, FiMessageCircle, FiStar } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const SHORTCUTS = [
  { title: 'Assignments', subtitle: 'Practice & submit', to: '/assignments', icon: FiEdit3, tone: 'bg-primary/10' },
  { title: 'Schedule', subtitle: 'Your live classes', to: '/schedule', icon: FiCalendar, tone: 'bg-secondary/15' },
  { title: 'Grades', subtitle: 'Results & feedback', to: '/grades', icon: FiStar, tone: 'bg-info/10' },
  { title: 'Messages', subtitle: 'Talk to your teacher', to: '/messages', icon: FiMessageCircle, tone: 'bg-accent/10' },
];

export function DashboardQuickNav() {
  return (
    <nav aria-label="Learning shortcuts" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {SHORTCUTS.map((item) => <Link key={item.to} to={item.to} className="card learning-panel group flex-row items-center gap-3 p-3 transition-colors hover:bg-base-100 sm:p-4">
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${item.tone}`}><item.icon aria-hidden className="text-lg" /></span>
        <div className="min-w-0 flex-1"><span className="block text-xs font-semibold sm:text-sm">{item.title}</span><span className="mt-1 hidden text-[10px] text-base-content/60 sm:block">{item.subtitle}</span></div>
        <FiArrowUpRight aria-hidden className="hidden shrink-0 text-base-content/40 sm:block" />
      </Link>)}
    </nav>
  );
}
