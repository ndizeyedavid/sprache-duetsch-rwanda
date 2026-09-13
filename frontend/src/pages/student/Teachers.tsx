import { useState } from 'react';
import { Panel } from '../../components/ui/Panel';
import { Pagination } from '../../components/ui/Pagination';
import { TeacherCard } from '../../components/cards/TeacherCard';
import { teachers } from '../../data/mock';

export function Teachers() {
  const [page, setPage] = useState(1);

  return (
    <Panel>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {teachers.map((teacher) => (
          <TeacherCard key={teacher.id} teacher={teacher} />
        ))}
      </div>
      <Pagination page={page} pages={3} from={1} to={6} total={100} onChange={setPage} />
    </Panel>
  );
}
