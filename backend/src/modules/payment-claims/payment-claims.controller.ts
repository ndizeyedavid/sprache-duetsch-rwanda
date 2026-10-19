import type { Request,Response } from "express";
import { actorId,validatedBody,validatedParams,validatedQuery } from "../../lib/request.js";
import { approveClaim,rejectClaim,submitClaim,withdrawClaim } from "./claim-commands.js";
import { listClaims,listMyClaims } from "./list-claims.js";
import type { ApproveClaimInput,ListClaimsQuery,SettleBalanceInput,SubmitClaimInput } from "./payment-claims.schema.js";
import { settleBalance } from "./settle-balance.js";

const id = (req: Request) => validatedParams<{ id: string }>(req).id;
const me = (req: Request) => actorId(req) as string;

export const submit = async (req: Request, res: Response) => { res.status(201).json({ success: true, data: await submitClaim(me(req), validatedBody<SubmitClaimInput>(req)) }); };
export const mine = async (req: Request, res: Response) => { res.json({ success: true, data: await listMyClaims(me(req)) }); };
export const withdraw = async (req: Request, res: Response) => { res.json({ success: true, data: await withdrawClaim(id(req), me(req)) }); };
export const list = async (req: Request, res: Response) => { res.json({ success: true, ...(await listClaims(validatedQuery<ListClaimsQuery>(req))) }); };
export const approve = async (req: Request, res: Response) => { res.json({ success: true, data: await approveClaim(id(req), validatedBody<ApproveClaimInput>(req), me(req)) }); };
export const reject = async (req: Request, res: Response) => { res.json({ success: true, data: await rejectClaim(id(req), validatedBody<{ reason: string }>(req).reason, me(req)) }); };
export const settle = async (req: Request, res: Response) => {
  const { studentId } = validatedParams<{ studentId: string }>(req);
  res.status(201).json({ success: true, data: await settleBalance(studentId, validatedBody<SettleBalanceInput>(req), me(req)) });
};
