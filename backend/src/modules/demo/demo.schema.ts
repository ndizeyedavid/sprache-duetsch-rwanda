import { z } from "zod";

export const demoAccountSchema = z.object({
  role: z.enum(["STUDENT", "TEACHER", "ACADEMIC_ADMIN", "FINANCE_ADMIN", "SUPER_ADMIN"]),
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});
export const demoAccountsSchema = z.array(demoAccountSchema).min(1);
export type DemoAccount = z.infer<typeof demoAccountSchema>;
