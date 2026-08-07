-- E-facture TEIF Tunisie : traçabilité + RAS + TTN
CREATE TYPE "TeifEInvoiceStatus" AS ENUM (
  'NONE',
  'GENERATED',
  'HASHED',
  'SIGNING',
  'SIGNED',
  'TRANSMITTED',
  'REJECTED'
);

ALTER TYPE "PaProvider" ADD VALUE 'TTN';

ALTER TABLE "Invoice"
  ADD COLUMN IF NOT EXISTS "applyWithholding" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "withholdingRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "withholdingAmount" DECIMAL(14,3) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "teifEInvoiceStatus" "TeifEInvoiceStatus" NOT NULL DEFAULT 'NONE',
  ADD COLUMN IF NOT EXISTS "teifXml" TEXT,
  ADD COLUMN IF NOT EXISTS "teifContentHash" TEXT,
  ADD COLUMN IF NOT EXISTS "teifSignature" TEXT,
  ADD COLUMN IF NOT EXISTS "teifSignedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "digigoSessionId" TEXT,
  ADD COLUMN IF NOT EXISTS "digigoCredentialId" TEXT,
  ADD COLUMN IF NOT EXISTS "ttnReference" TEXT,
  ADD COLUMN IF NOT EXISTS "ttnSubmittedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "teifLastError" TEXT;

CREATE INDEX IF NOT EXISTS "Invoice_organizationId_teifEInvoiceStatus_idx"
  ON "Invoice"("organizationId", "teifEInvoiceStatus");
