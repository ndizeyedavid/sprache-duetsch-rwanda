-- Student-reported payments (outside the gateway) awaiting finance approval.
CREATE TYPE "PaymentClaimStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "PaymentClaim" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "methodId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RWF',
    "reference" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "status" "PaymentClaimStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PaymentClaim_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PaymentClaim_paymentId_key" ON "PaymentClaim"("paymentId");
CREATE INDEX "PaymentClaim_status_createdAt_idx" ON "PaymentClaim"("status", "createdAt");
CREATE INDEX "PaymentClaim_studentId_createdAt_idx" ON "PaymentClaim"("studentId", "createdAt");

ALTER TABLE "PaymentClaim" ADD CONSTRAINT "PaymentClaim_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentClaim" ADD CONSTRAINT "PaymentClaim_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES "PaymentMethodConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PaymentClaim" ADD CONSTRAINT "PaymentClaim_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PaymentClaim" ADD CONSTRAINT "PaymentClaim_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
