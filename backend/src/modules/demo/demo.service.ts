import { env } from "../../config/env.js";
import type { DemoAccount } from "./demo.schema.js";
import { demoAccountsSchema } from "./demo.schema.js";

const ORDER: DemoAccount["role"][] = ["STUDENT", "TEACHER", "ACADEMIC_ADMIN", "FINANCE_ADMIN", "SUPER_ADMIN"];

/** Parsed once at startup so a bad DEMO_ACCOUNTS value fails the deploy instead of a request. */
const accounts: DemoAccount[] | null = env.DEMO_ACCOUNTS
  ? demoAccountsSchema.parse(JSON.parse(env.DEMO_ACCOUNTS)).sort((a, b) => ORDER.indexOf(a.role) - ORDER.indexOf(b.role))
  : null;

export const listDemoAccounts = (): DemoAccount[] | null => accounts;
