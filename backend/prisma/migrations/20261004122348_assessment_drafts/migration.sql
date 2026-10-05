-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "protectedMode" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Attempt" ADD COLUMN     "draftResponses" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "draftUpdatedAt" TIMESTAMP(3);
