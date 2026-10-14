export type ClassDraft = {
  code: string; name: string; levelId: string; intakeId: string; campusId: string;
  teacherId: string; shift: string; capacity: string; room: string; isActive: boolean;
  /** Blank inherits the level / system threshold. */
  attendanceAlertThreshold: string;
};
