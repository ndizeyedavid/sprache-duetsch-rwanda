import { useParams } from 'react-router-dom';
import { ActivityWork } from '../../components/assignments/ActivityWork';
import { AssessmentWork } from '../../components/assignments/AssessmentWork';
import { AssignmentDetailHeader } from '../../components/assignments/AssignmentDetailHeader';
import type { AssignmentDetailData } from '../../components/assignments/types';
import { ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { getMyAssignmentDetail } from '../../lib/services';

import { HomeworkDetail } from "../../components/assignments/homework/HomeworkDetail";

export function AssignmentDetail() {
  const { id = '' } = useParams();
  const detail = useApi(`assignment-${id}`, () => getMyAssignmentDetail(id), Boolean(id) && !id.startsWith('HW-'));
  if (id.startsWith('HW-')) return <HomeworkDetail id={id.slice(3)} />;
  if (detail.loading || detail.stale) return <LoadingBlock label="Loading assignment…" />;
  if (detail.error || !detail.data) return <ErrorBlock message={detail.error ?? 'Could not load assignment.'} onRetry={detail.refetch} />;
  const data = detail.data as AssignmentDetailData;
  return (
    <div className="journey-enter space-y-4">
      <AssignmentDetailHeader data={data} />
      {data.source === 'ACTIVITY' && data.activity ? <ActivityWork key={id} data={data} activity={data.activity} refetch={detail.refetch} />
        : data.assessment ? <AssessmentWork key={id} data={data} /> : <ErrorBlock message="Assignment content is unavailable." onRetry={detail.refetch} />}
    </div>
  );
}
