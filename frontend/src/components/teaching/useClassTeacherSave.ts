import { useEffect,useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import type { ClassGroupItem } from '../../lib/services';
import { assignClassTeacher } from '../../lib/teaching';

/**
 * Selection + save state for one class. `savedId` is compared against the
 * refetched `group.teacherId` so the confirmation survives the refetch instead
 * of flashing out the moment the roster reloads.
 */
export function useClassTeacherSave(group: ClassGroupItem, onSaved: () => void) {
  const [id, setId] = useState(group.teacherId ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    setId(group.teacherId ?? '');
    setSavedId((current) => (current === group.teacherId ? current : null));
  }, [group.id, group.teacherId]);

  const current = group.teacherId ?? '';
  const changed = id !== current;
  const saved = savedId !== null && savedId === current;

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await assignClassTeacher(group.id, id || null);
      setSavedId(id || '');
      onSaved();
    } catch (caught) {
      setError(apiErrorMessage(caught, 'Could not assign this teacher. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return { id, setId, saving, error, changed, saved, save };
}