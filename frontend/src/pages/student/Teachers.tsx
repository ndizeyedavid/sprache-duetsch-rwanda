import { Panel, SectionHeader } from '../../components/ui/Panel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { humanize, listTeachers } from '../../lib/services';

function initials(firstName: string, lastName: string): string {
 return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function Teachers() {
 const teachers = useApi('teachers', listTeachers);

 return (
 <div className="space-y-5">
 <Panel>
 <SectionHeader title="Teachers" action={{ label: 'Schedule', to: '/schedule' }} />
 {teachers.loading ? (
 <LoadingBlock label="Loading teachers…" />
 ) : teachers.error || !teachers.data ? (
 <ErrorBlock message={teachers.error ?? 'Could not load teachers.'} onRetry={teachers.refetch} />
 ) : teachers.data.length === 0 ? (
 <EmptyBlock title="No teachers yet" hint="Teachers appear here once an admin adds them." />
 ) : (
 <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
 {teachers.data.map((teacher) => (
 <article key={teacher.id} className=" rounded-box bg-base-100 p-4 text-center">
 <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-brand-tint text-xl font-bold text-brand">
 {initials(teacher.firstName, teacher.lastName)}
 </span>
 <h3 className="mt-3 text-sm font-semibold">
 {teacher.firstName} {teacher.lastName}
 </h3>
 <p className="mt-1 truncate text-xs text-muted">{teacher.email}</p>
 {teacher.phone ? (
 <p className="mt-0.5 text-xs text-muted">{teacher.phone}</p>
 ) : null}
 <div className="mt-3 flex justify-center">
 <StatusBadge status={humanize(teacher.status)} />
 </div>
 </article>
 ))}
 </div>
 )}
 </Panel>
 </div>
 );
}
