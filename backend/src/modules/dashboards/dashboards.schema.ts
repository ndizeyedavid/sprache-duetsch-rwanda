import { z } from "zod";

// Shared filter block for every dashboard endpoint. Each dashboard only applies the
// fields that are meaningful for it (e.g. teacherId on /teacher, from/to on academic KPIs).
export const dashboardFilterSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  intakeId: z.string().min(1).optional(),
  levelId: z.string().min(1).optional(),
  campusId: z.string().min(1).optional(),
  teacherId: z.string().min(1).optional(),
});

export type DashboardFilter = z.infer<typeof dashboardFilterSchema>;
