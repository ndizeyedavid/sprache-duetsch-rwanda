import type { Request, Response } from "express";
import { unauthorized } from "../../lib/http-error.js";
import { actorId, validatedBody, validatedParams, validatedQuery } from "../../lib/request.js";
import * as service from "./certificates.service.js";
import type {
  IssueCertificateInput,
  ListCertificatesQuery,
  RevokeCertificateInput,
} from "./certificates.schema.js";

export const issue = async (req: Request, res: Response): Promise<void> => {
  const certificate = await service.issueCertificate(
    validatedBody<IssueCertificateInput>(req),
    actorId(req),
  );
  res.status(201).json({ success: true, data: certificate });
};

export const revoke = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const { reason } = validatedBody<RevokeCertificateInput>(req);
  const certificate = await service.revokeCertificate(id, reason, actorId(req));
  res.json({ success: true, data: certificate });
};

export const reissue = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const certificate = await service.reissueCertificate(id, actorId(req));
  res.status(201).json({ success: true, data: certificate });
};

export const eligibility = async (req: Request, res: Response): Promise<void> => {
  const { studentId, levelId } = req.query as { studentId: string; levelId: string };
  const result = await service.checkEligibility(studentId, levelId);
  res.json({ success: true, data: result });
};

export const get = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw unauthorized();
  }
  const { id } = validatedParams<{ id: string }>(req);
  const certificate = await service.getCertificate(id, req.user.id, req.user.role);
  res.json({ success: true, data: certificate });
};

export const list = async (req: Request, res: Response): Promise<void> => {
  const result = await service.listCertificates(validatedQuery<ListCertificatesQuery>(req));
  res.json({ success: true, ...result });
};

export const mine = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw unauthorized();
  }
  const certificates = await service.listMyCertificates(req.user.id);
  res.json({ success: true, data: certificates });
};

export const verify = async (req: Request, res: Response): Promise<void> => {
  const { code } = req.params as { code: string };
  const result = await service.verifyCertificate(code);
  res.json({ success: true, data: result });
};

export const pdf = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw unauthorized();
  }
  const { id } = validatedParams<{ id: string }>(req);
  await service.getCertificate(id, req.user.id, req.user.role);
  const buffer = await service.renderCertificatePdf(id);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="certificate-${id.slice(0, 8)}.pdf"`);
  res.send(buffer);
};
