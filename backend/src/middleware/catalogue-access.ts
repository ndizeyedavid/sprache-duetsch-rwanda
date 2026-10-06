import type { RequestHandler } from 'express';
import { withoutFinancialFields } from '../lib/financial-visibility.js';
import { FINANCE_ROLES } from '../lib/roles.js';
import { requireAuth } from './auth.js';

/** Public catalogues expose academic metadata; financial fields require finance access. */
export const catalogueAccess: RequestHandler = (req, res, next) => {
  function finish(error?: unknown): void {
    if (error) { next(error); return; }
    if (!req.user || !FINANCE_ROLES.includes(req.user.role)) {
      const sendJson = res.json.bind(res);
      res.json = (body: unknown) => sendJson(withoutFinancialFields(body));
    }
    next();
  }
  if (req.headers.authorization) requireAuth(req, res, finish);
  else finish();
};
