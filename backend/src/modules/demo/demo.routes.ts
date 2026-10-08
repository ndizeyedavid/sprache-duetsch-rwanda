import { Router } from "express";
import * as controller from "./demo.controller.js";

/** Public test-account list. Exists only while DEMO_ACCOUNTS is configured. */
export const demoRouter = Router();
// Synchronous handler: Express 5 forwards its thrown 404 to the error handler.
demoRouter.get("/accounts", controller.accounts);
