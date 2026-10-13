import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import * as controller from "./catalog.controller.js";

export const catalogRouter = Router();

// Public: no sign-in, cacheable. Powers /catalog and /apply.
catalogRouter.get("/", asyncHandler(controller.catalog));
