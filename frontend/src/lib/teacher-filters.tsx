import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

type TeacherFilters = {
 levelId: string | null;
 campusId: string | null;
 intakeId: string | null;
 classGroupId: string | null;
 setLevelId: (value: string | null) => void;
 setCampusId: (value: string | null) => void;
 setIntakeId: (value: string | null) => void;
 setClassGroupId: (value: string | null) => void;
 clear: () => void;
};

const TeacherFiltersContext = createContext<TeacherFilters | null>(null);

export function TeacherFiltersProvider({ children }: { children: ReactNode }) {
 const [levelId, setLevelId] = useState<string | null>(null);
 const [campusId, setCampusId] = useState<string | null>(null);
 const [intakeId, setIntakeId] = useState<string | null>(null);
 const [classGroupId, setClassGroupId] = useState<string | null>(null);

 const value = useMemo<TeacherFilters>(
 () => ({
 levelId,
 campusId,
 intakeId,
 classGroupId,
 setLevelId,
 setCampusId,
 setIntakeId,
 setClassGroupId,
 clear: () => {
 setLevelId(null);
 setCampusId(null);
 setIntakeId(null);
 setClassGroupId(null);
 },
 }),
 [levelId, campusId, intakeId, classGroupId],
 );

 return <TeacherFiltersContext.Provider value={value}>{children}</TeacherFiltersContext.Provider>;
}

// Provider and hook intentionally share a file; hook is not a component.
// eslint-disable-next-line react-refresh/only-export-components
export function useTeacherFilters(): TeacherFilters {
 const context = useContext(TeacherFiltersContext);
 if (!context) {
 throw new Error('useTeacherFilters must be used inside a TeacherFiltersProvider');
 }
 return context;
}
