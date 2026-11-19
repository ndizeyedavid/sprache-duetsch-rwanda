-- Mobile money moves from Paypack to XendlyPay (2026-10-19). Nothing is deleted: Paypack history is kept and labelled.

-- Checkouts: which gateway handled them, and why a request failed.
ALTER TABLE "PaymentCheckout" ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'PAYPACK';
ALTER TABLE "PaymentCheckout" ALTER COLUMN "provider" SET DEFAULT 'XENDLYPAY';
ALTER TABLE "PaymentCheckout" ADD COLUMN "failureReason" TEXT;
CREATE INDEX "PaymentCheckout_provider_status_idx" ON "PaymentCheckout"("provider", "status");

-- Paypack can no longer confirm anything, so a Paypack request still open is closed with an explanation
-- (finance records any money Paypack did receive by hand, from the Paypack dashboard).
UPDATE "PaymentCheckout"
SET "status" = 'FAILED',
    "failureReason" = 'Paypack was retired on 2026-10-19 before this request was confirmed. Finance: check the Paypack dashboard and record any money received manually.'
WHERE "provider" = 'PAYPACK' AND "status" IN ('INITIATING', 'PENDING', 'UNKNOWN');

-- Webhook inbox shared by gateways; Paypack callbacks are copied over unchanged.
CREATE TABLE "PaymentWebhookEvent" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "providerRef" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentWebhookEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PaymentWebhookEvent_provider_processedAt_idx" ON "PaymentWebhookEvent"("provider", "processedAt");
CREATE INDEX "PaymentWebhookEvent_providerRef_idx" ON "PaymentWebhookEvent"("providerRef");

INSERT INTO "PaymentWebhookEvent" ("id", "provider", "type", "providerRef", "payload", "processedAt", "createdAt")
SELECT 'paypack:' || "id", 'PAYPACK', 'transaction:processed', "providerRef", "payload", COALESCE("processedAt", CURRENT_TIMESTAMP), "createdAt"
FROM "PaypackEvent";

DROP TABLE "PaypackEvent";

-- The Paypack ledger method stays for historical payments but can no longer be chosen.
UPDATE "PaymentMethodConfig" SET "isActive" = false, "name" = 'Paypack (retired)' WHERE "code" = 'PAYPACK';
