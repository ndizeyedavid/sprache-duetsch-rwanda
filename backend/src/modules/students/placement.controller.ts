import type { Request,Response } from "express";
import { unauthorized } from "../../lib/http-error.js";
import { actorId,validatedBody,validatedParams,validatedQuery } from "../../lib/request.js";
import { decidePlacement } from "./decide-placement.js";
import { getMyPlacement } from "./get-my-placement.js";
import { listPlacementQueue,listStudentPlacements } from "./list-placements.js";
import type { ManualPlacementInput,PlacementDecisionInput,PlacementDraftInput,PlacementQueueQuery,PlacementSubmitInput } from "./placement.schema.js";
import { runPlacement } from "./run-placement.js";
import { saveMyPlacementDraft } from "./save-my-placement-draft.js";
import { startMyPlacement } from "./start-my-placement.js";
import { submitMyPlacement } from "./submit-my-placement.js";

const userId = (req: Request): string => {
  const id = req.user?.id;
  if (!id) throw unauthorized();
  return id;
};

export const mine = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: await getMyPlacement(userId(req)) });
};

export const start = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: await startMyPlacement(userId(req)) });
};

export const saveDraft = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const { responses } = validatedBody<PlacementDraftInput>(req);
  res.json({ success: true, data: await saveMyPlacementDraft(userId(req), id, responses) });
};

export const submit = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  res.json({ success: true, data: await submitMyPlacement(userId(req), id, validatedBody<PlacementSubmitInput>(req)) });
};

export const queue = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: await listPlacementQueue(validatedQuery<PlacementQueueQuery>(req)) });
};

export const history = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  res.json({ success: true, data: await listStudentPlacements(id) });
};

export const manual = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const data = await runPlacement(id, validatedBody<ManualPlacementInput>(req), actorId(req));
  res.status(201).json({ success: true, data });
};

export const decide = async (req: Request, res: Response): Promise<void> => {
  const { id, resultId } = validatedParams<{ id: string; resultId: string }>(req);
  const data = await decidePlacement(id, resultId, validatedBody<PlacementDecisionInput>(req), actorId(req));
  res.json({ success: true, data });
};
