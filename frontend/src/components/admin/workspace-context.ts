import type { IconType } from 'react-icons';
import { FiAward,FiBookOpen,FiCalendar,FiCreditCard,FiGrid,FiMessageCircle,FiRadio,FiUsers } from 'react-icons/fi';

type Context = { category: string; icon: IconType; image: string; links: { label: string; to: string }[] };
const books = '/illustrations/study-books.webp';
const learner = '/illustrations/course-learner.webp';
const owl = '/illustrations/learning-owl.webp';
export const WORKSPACE_CONTEXT: Record<string, Context> = {
  students: { category: 'Learner support', icon: FiUsers, image: learner, links: [{ label: 'Enrolments', to: '/admin/enrolments' }, { label: 'Attendance', to: '/admin/attendance' }] },
  classes: { category: 'Academic coordination', icon: FiGrid, image: books, links: [{ label: 'Teacher coverage', to: '/admin/teaching' }, { label: 'Schedule', to: '/admin/schedule' }] },
  courses: { category: 'Learning design', icon: FiBookOpen, image: books, links: [{ label: 'Resources', to: '/admin/resources' }, { label: 'Assignments', to: '/admin/assignments' }] },
  assignments: { category: 'Practice & feedback', icon: FiBookOpen, image: owl, links: [{ label: 'Curriculum', to: '/admin/courses' }, { label: 'Classes', to: '/admin/classes' }] },
  enrolments: { category: 'Learner journeys', icon: FiUsers, image: learner, links: [{ label: 'Students', to: '/admin/students' }, { label: 'Intakes', to: '/admin/intakes' }] },
  people: { category: 'Your school team', icon: FiUsers, image: learner, links: [{ label: 'Teaching', to: '/admin/teaching' }, { label: 'Classes', to: '/admin/classes' }] },
  teaching: { category: 'Teacher coverage', icon: FiBookOpen, image: books, links: [{ label: 'People', to: '/admin/people' }, { label: 'Classes', to: '/admin/classes' }] },
  schedule: { category: 'Learning calendar', icon: FiCalendar, image: owl, links: [{ label: 'Classes', to: '/admin/classes' }, { label: 'Live classes', to: '/admin/live-class' }] },
  attendance: { category: 'Participation & support', icon: FiUsers, image: learner, links: [{ label: 'Students', to: '/admin/students' }, { label: 'Live classes', to: '/admin/live-class' }] },
  finance: { category: 'Tuition overview', icon: FiCreditCard, image: books, links: [{ label: 'Transactions', to: '/admin/transactions' }, { label: 'Students', to: '/admin/students' }] },
  transactions: { category: 'Payment records', icon: FiCreditCard, image: books, links: [{ label: 'Finance overview', to: '/admin/finance' }, { label: 'Enrolments', to: '/admin/enrolments' }] },
  intakes: { category: 'Cohort planning', icon: FiCalendar, image: owl, links: [{ label: 'Enrolments', to: '/admin/enrolments' }, { label: 'Classes', to: '/admin/classes' }] },
  certificates: { category: 'Certificates', icon: FiAward, image: owl, links: [{ label: 'Students', to: '/admin/students' }, { label: 'Curriculum', to: '/admin/courses' }] },
  announcements: { category: 'School communication', icon: FiMessageCircle, image: owl, links: [{ label: 'Messages', to: '/admin/messages' }, { label: 'Schedule', to: '/admin/schedule' }] },
  resources: { category: 'Learning library', icon: FiBookOpen, image: books, links: [{ label: 'Curriculum', to: '/admin/courses' }, { label: 'Announcements', to: '/admin/announcements' }] },
  'live-class': { category: 'Live learning', icon: FiRadio, image: learner, links: [{ label: 'Schedule', to: '/admin/schedule' }, { label: 'Attendance', to: '/admin/attendance' }] },
  organisation: { category: 'School operations', icon: FiGrid, image: books, links: [{ label: 'Intakes', to: '/admin/intakes' }, { label: 'Classes', to: '/admin/classes' }] },
  messages: { category: 'Conversations', icon: FiMessageCircle, image: learner, links: [{ label: 'Announcements', to: '/admin/announcements' }, { label: 'People', to: '/admin/people' }] },
  activity: { category: 'Community updates', icon: FiMessageCircle, image: owl, links: [{ label: 'Messages', to: '/admin/messages' }, { label: 'Announcements', to: '/admin/announcements' }] },
};
