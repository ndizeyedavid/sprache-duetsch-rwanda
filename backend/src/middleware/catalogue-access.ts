import type { RequestHandler } from 'express';
import { coursePriceFields,withoutFinancialFields } from '../lib/financial-visibility.js';
import { FINANCE_ROLES } from '../lib/roles.js';
import { requireAuth } from './auth.js';

/** Public catalogues expose academic metadata; financial fields require finance access. */
export const catalogueAccess: RequestHandler = (req, res, next) => {
  function finish(error?: unknown): void {
    if (error) { next(error); return; }
    if (!req.user || !FINANCE_ROLES.includes(req.user.role)) {
      const sendJson = res.json.bind(res);
      const allowed = req.baseUrl === '/api/levels' ? coursePriceFields : new Set<string>();
      res.json = (body: unknown) => sendJson(withoutFinancialFields(body, allowed));
    }
    next();
  }
  if (req.headers.authorization) requireAuth(req, res, finish);
  else finish();
};
