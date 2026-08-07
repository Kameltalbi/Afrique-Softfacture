-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'REIMBURSED');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('MEALS', 'TRANSPORT', 'ACCOMMODATION', 'SUPPLIES', 'TELECOM', 'OTHER');

-- CreateTable
CREATE TABLE "ExpenseReport" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT,
    "title" TEXT NOT NULL,
    "number" TEXT,
    "status" "ExpenseStatus" NOT NULL DEFAULT 'DRAFT',
    "currency" TEXT NOT NULL DEFAULT 'TND',
    "expenseDate" DATE NOT NULL,
    "notes" TEXT,
    "subtotalHt" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "vatTotal" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "totalTtc" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "reimbursedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseLine" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "expenseDate" DATE NOT NULL,
    "category" "ExpenseCategory" NOT NULL DEFAULT 'OTHER',
    "description" TEXT NOT NULL,
    "vendor" TEXT,
    "amountHt" DECIMAL(14,3) NOT NULL,
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "vatAmount" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "amountTtc" DECIMAL(14,3) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExpenseReport_organizationId_idx" ON "ExpenseReport"("organizationId");

-- CreateIndex
CREATE INDEX "ExpenseReport_organizationId_status_idx" ON "ExpenseReport"("organizationId", "status");

-- CreateIndex
CREATE INDEX "ExpenseReport_createdById_idx" ON "ExpenseReport"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseReport_organizationId_number_key" ON "ExpenseReport"("organizationId", "number");

-- CreateIndex
CREATE INDEX "ExpenseLine_reportId_idx" ON "ExpenseLine"("reportId");

-- AddForeignKey
ALTER TABLE "ExpenseReport" ADD CONSTRAINT "ExpenseReport_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseReport" ADD CONSTRAINT "ExpenseReport_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseLine" ADD CONSTRAINT "ExpenseLine_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "ExpenseReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
