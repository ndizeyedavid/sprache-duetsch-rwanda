-- CreateEnum
CREATE TYPE "CheckoutStatus" AS ENUM ('INITIATING', 'PENDING', 'UNKNOWN', 'SUCCESSFUL', 'FAILED');

-- CreateTable
CREATE TABLE "PaymentCheckout" (
    "id" TEXT NOT NULL,
    "requestKey" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RWF',
    "status" "CheckoutStatus" NOT NULL DEFAULT 'INITIATING',
    "providerRef" TEXT,
    "paymentId" TEXT,
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentCheckout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaypackEvent" (
    "id" TEXT NOT NULL,
    "providerRef" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaypackEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentCheckout_requestKey_key" ON "PaymentCheckout"("requestKey");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentCheckout_providerRef_key" ON "PaymentCheckout"("providerRef");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentCheckout_paymentId_key" ON "PaymentCheckout"("paymentId");

-- CreateIndex
CREATE INDEX "PaymentCheckout_studentId_createdAt_idx" ON "PaymentCheckout"("studentId", "createdAt");

-- CreateIndex
CREATE INDEX "PaymentCheckout_status_lastCheckedAt_idx" ON "PaymentCheckout"("status", "lastCheckedAt");

-- CreateIndex
CREATE INDEX "PaypackEvent_providerRef_processedAt_idx" ON "PaypackEvent"("providerRef", "processedAt");

-- AddForeignKey
ALTER TABLE "PaymentCheckout" ADD CONSTRAINT "PaymentCheckout_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentCheckout" ADD CONSTRAINT "PaymentCheckout_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

