ALTER TABLE "StudentFinance" ADD COLUMN "overdueAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "nextDueAmount" DECIMAL(12,2) NOT NULL DEFAULT 0, ADD COLUMN "nextDueAt" TIMESTAMP(3);
ALTER TABLE "Attempt" ADD COLUMN "questionSnapshot" JSONB;
ALTER TABLE "Level" ADD COLUMN "coursebookUrl" TEXT, ADD COLUMN "coursebookPages" INTEGER,
  ADD COLUMN "completionRules" JSONB;
ALTER TABLE "Receipt" ADD COLUMN "voidedAt" TIMESTAMP(3);

CREATE TABLE "IdentifierCounter" ("prefix" TEXT PRIMARY KEY, "value" INTEGER NOT NULL);
INSERT INTO "IdentifierCounter" ("prefix", "value")
SELECT regexp_replace("studentCode", '[0-9]+$', ''), MAX(substring("studentCode" from '[0-9]+$')::integer)
FROM "Student" WHERE "studentCode" ~ '^SDR-[0-9]{4}-[0-9]+$' GROUP BY 1;
INSERT INTO "IdentifierCounter" ("prefix", "value")
SELECT regexp_replace("receiptNumber", '[0-9]+$', ''), MAX(substring("receiptNumber" from '[0-9]+$')::integer)
FROM "Receipt" WHERE "receiptNumber" ~ '^RCP-[0-9]{8}-[0-9]+$' GROUP BY 1;
INSERT INTO "IdentifierCounter" ("prefix", "value")
SELECT regexp_replace("certificateNumber", '[0-9]+$', ''), MAX(substring("certificateNumber" from '[0-9]+$')::integer)
FROM "Certificate" WHERE "certificateNumber" ~ '^CERT-[0-9]{4}-[0-9]+$' GROUP BY 1;

CREATE TABLE "NotificationDelivery" (
  "id" TEXT PRIMARY KEY, "eventKey" TEXT UNIQUE, "userId" TEXT NOT NULL,
  "payload" JSONB NOT NULL, "email" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0, "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastError" TEXT, "sentAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "NotificationDelivery_status_nextAttemptAt_idx" ON "NotificationDelivery"("status", "nextAttemptAt");
CREATE TABLE "UploadedFile" (
  "name" TEXT PRIMARY KEY, "uploaderId" TEXT NOT NULL, "mimeType" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
