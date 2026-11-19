// What the "Enrol" panel pre-fills for an application. Website applicants only choose a level, so staff
// get a sensible intake and campus to confirm instead of empty dropdowns.
import type { ApplicationDetail } from '../../lib/admissions-types';
import type { ClassGroupItem,IntakeItem } from '../../lib/services';

/** Intakes that teach the level and still take students (or the application's own, if already set). */
export function intakesFor(intakes: IntakeItem[], levelId: string, keepId?: string | null): IntakeItem[] {
  const today = new Date().toISOString().slice(0, 10);
  return intakes.filter((intake) => intake.id === keepId
    || (intake.isActive && intake.endDate.slice(0, 10) >= today && intake.levels?.some((level) => level.id === levelId)));
}

/** The application's intake, else the newest open intake that teaches this level. */
export function suggestIntake(app: ApplicationDetail, intakes: IntakeItem[], levelId: string): string {
  if (app.intakeId && app.levelId === levelId) return app.intakeId;
  const open = intakesFor(intakes, levelId).filter((intake) => intake.registrationOpen);
  return [...open].sort((a, b) => b.startDate.localeCompare(a.startDate))[0]?.id ?? '';
}

/** Active classes for the course; the campus filter applies once one is chosen. */
export function classesFor(classes: ClassGroupItem[], levelId: string, intakeId: string, campusId = ''): ClassGroupItem[] {
  return classes.filter((group) => group.isActive && group.levelId === levelId && group.intakeId === intakeId && (!campusId || group.campusId === campusId));
}

/** The application's campus, else the only campus running a class for this course (marked "suggested"). */
export function suggestCampus(app: ApplicationDetail, classes: ClassGroupItem[], levelId: string, intakeId: string): { id: string; suggested: boolean } {
  if (app.campusId) return { id: app.campusId, suggested: false };
  const campuses = [...new Set(classesFor(classes, levelId, intakeId).map((group) => group.campusId))];
  return campuses.length === 1 ? { id: campuses[0] ?? '', suggested: true } : { id: '', suggested: false };
}

/** Whom to enrol by default: the linked student, else the account the website made for this email ('' = a new account). */
export function defaultStudent(app: ApplicationDetail): string {
  return app.student?.id ?? app.matches?.students.find((student) => student.own)?.id ?? '';
}
