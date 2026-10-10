import { useApi } from '../../hooks/useApi';
import { apiGet } from '../../lib/api';
import { ErrorBlock,LoadingBlock } from '../common/PageState';
import type { StudentSessionDetail } from './StudentDetailDrawerContent';
import { StudentDetailDrawerContent } from './StudentDetailDrawerContent';
export function StudentSessionDetails({id,onClose}:{id:string;onClose:()=>void}) {
  const detail=useApi(`student-session-${id}`,()=>apiGet<StudentSessionDetail>(`/sessions/me/${id}`));
  if(detail.data)return <StudentDetailDrawerContent session={detail.data} onClose={onClose} />;
  return <div className="fixed inset-0 z-40 flex justify-end"><button aria-label="Close details" className="absolute inset-0 bg-neutral/40" onClick={onClose} /><aside className="relative h-full w-full max-w-md bg-base-100 p-5"><button className="btn btn-sm" onClick={onClose}>Close</button>{detail.error?<ErrorBlock message={detail.error} onRetry={detail.refetch}/>:<LoadingBlock label="Loading class details…"/>}</aside></div>;
}
