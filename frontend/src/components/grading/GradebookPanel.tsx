import { EmptyBlock, ErrorBlock, LoadingBlock } from '../common/PageState';
import { humanize } from '../../lib/services';

type Student = { student: { id: string; studentCode: string; user: { firstName: string; lastName: string } } };
type Assessment = { id: string; title: string; levelId: string };
type Attempt = { id: string; status: string; score: number | null; student: { studentCode: string }; assessment: { id: string } };

type Props = {
 loading: boolean;
 error: string | null;
 onRetry: () => void;
 students: Student[];
 assessments: Assessment[];
 attempts: Attempt[];
 onJump: (id: string, status: string) => void;
};

export function GradebookPanel({ loading, error, onRetry, students, assessments, attempts, onJump }: Props) {
 if (loading) return <LoadingBlock label="Loading gradebook…" />;
 if (error) return <ErrorBlock message={error} onRetry={onRetry} />;
 if (students.length === 0) return <EmptyBlock title="No students in this class" />;
 if (assessments.length === 0) return <EmptyBlock title="No assessments for this level" hint="Create assessments for this level first." />;

 const map = new Map<string, Attempt>();
 for (const a of attempts) {
 const key = `${a.student.studentCode}-${a.assessment.id}`;
 if (!map.has(key)) map.set(key, a);
 }

 return (
 <div className="overflow-x-auto">
 <table className="table w-full text-xs">
 <thead>
 <tr className="bg-base-200/60 text-muted">
 <th className="sticky left-0 z-10 bg-base-200/60 text-left">Student</th>
 {assessments.map((a) => (
 <th key={a.id} className="text-center" title={a.title}><span className="block max-w-24 truncate">{a.title}</span></th>
 ))}
 </tr>
 </thead>
 <tbody>
 {students.map((row) => (
 <tr key={row.student.id} className="border-t border-line hover:bg-base-200/30">
 <td className="sticky left-0 z-10 bg-base-100 py-2 pr-2 font-medium">
 <span className="block truncate">{row.student.user.firstName} {row.student.user.lastName}</span>
 <span className="block font-mono text-[11px] text-muted">{row.student.studentCode}</span>
 </td>
 {assessments.map((a) => {
 const att = map.get(`${row.student.studentCode}-${a.id}`);
 if (!att) return <td key={a.id} className="text-center text-muted">—</td>;
 const isGraded = att.status === 'GRADED';
 return (
 <td key={a.id} className="text-center">
 <button type="button" onClick={() => onJump(att.id, att.status)} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${isGraded ? 'bg-brand-soft text-[#B30A00] hover:bg-brand hover:text-white' : 'bg-sun-soft text-[#8A6800] hover:bg-sun hover:text-white'}`}>
 {att.score != null ? String(att.score) : humanize(att.status)}
 </button>
 </td>
 );
 })}
 </tr>
 ))}
 </tbody>
 </table>
 <p className="mt-2 text-[11px] text-muted">Click a score to jump to SpeedGrader for that submission.</p>
 </div>
 );
}
