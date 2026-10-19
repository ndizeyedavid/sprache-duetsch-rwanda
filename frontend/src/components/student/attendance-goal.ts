/** Attendance most certificates require; matches the default low-attendance alert. */
export const ATTENDANCE_GOAL = 75;

export function attendanceMessage(percentage: number, total: number): { heading: string; text: string } {
  if (!total) return { heading: 'Jede Stunde zählt.', text: `Your teacher marks attendance in every live class. Aim for ${ATTENDANCE_GOAL}% or more — it counts towards your certificate.` };
  if (percentage >= 90) return { heading: 'Ausgezeichnet!', text: `${percentage}% — well above the ${ATTENDANCE_GOAL}% goal. Keep it up.` };
  if (percentage >= ATTENDANCE_GOAL) return { heading: 'Gut so!', text: `You're ${percentage - ATTENDANCE_GOAL} points above the ${ATTENDANCE_GOAL}% goal.` };
  return { heading: 'Achtung!', text: `You're ${ATTENDANCE_GOAL - percentage} points below the ${ATTENDANCE_GOAL}% goal. Talk to your teacher about catching up.` };
}
