import { z } from "zod";

// Payload sent by the external registration site. Only `email` is needed for the
// confirmation email — everything else is accepted and discarded as requested.
export const enrollmentConfirmSchema = z.object({
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(50).optional().or(z.literal("")),
  course: z.string().max(100).optional().or(z.literal("")),
  schedule: z.string().max(100).optional().or(z.literal("")),
  experience: z.string().max(500).optional().or(z.literal("")),
  message: z.string().max(2000).optional().or(z.literal("")),
  submitted_at: z.string().max(100).optional().or(z.literal("")),
});

export type EnrollmentConfirmInput = z.infer<typeof enrollmentConfirmSchema>;
