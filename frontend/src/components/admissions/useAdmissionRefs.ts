import { useApi } from '../../hooks/useApi';
import { listCampuses,listClasses,listIntakesFull,listLevels } from '../../lib/services';
import type { ClassGroupItem,IntakeItem,LevelItem,ReferenceItem } from '../../lib/services';

export type AdmissionRefs = {
  levels: LevelItem[];
  intakes: IntakeItem[];
  campuses: ReferenceItem[];
  classes: ClassGroupItem[];
};

/** Reference lists for filters, course corrections and class choice when enrolling. */
export function useAdmissionRefs(): AdmissionRefs {
  const levels = useApi('levels-catalog', listLevels);
  const intakes = useApi('intakes-full', listIntakesFull);
  const campuses = useApi('campuses-list', listCampuses);
  const classes = useApi('admin-classes', listClasses);
  return {
    levels: levels.data ?? [],
    intakes: intakes.data ?? [],
    campuses: campuses.data ?? [],
    classes: classes.data ?? [],
  };
}
