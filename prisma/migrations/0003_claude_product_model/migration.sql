CREATE TYPE "CategoryKind" AS ENUM ('expense', 'income');
CREATE TYPE "PaymentMethodType" AS ENUM ('credit', 'debit', 'wallet', 'cash', 'transfer', 'auto');
CREATE TYPE "TransactionSourceType" AS ENUM ('recurring_bill_payment', 'debt_payment');

CREATE TABLE "Bank" (
  "id" TEXT NOT NULL,
  "householdId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "color" TEXT NOT NULL DEFAULT '#0E3B2E',
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Category" ADD COLUMN "icon" TEXT NOT NULL DEFAULT 'tag';
ALTER TABLE "Category" ADD COLUMN "color" TEXT NOT NULL DEFAULT '#F7F7F8';
ALTER TABLE "Category" ADD COLUMN "budget" DECIMAL(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE "Category" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Category" ADD COLUMN "kind" "CategoryKind" NOT NULL DEFAULT 'expense';

ALTER TABLE "PaymentMethod" ADD COLUMN "bankId" TEXT;
ALTER TABLE "PaymentMethod" ADD COLUMN "type" "PaymentMethodType" NOT NULL DEFAULT 'cash';
ALTER TABLE "PaymentMethod" ADD COLUMN "last4" TEXT;

ALTER TABLE "Transaction" ADD COLUMN "sourceType" "TransactionSourceType";
ALTER TABLE "Transaction" ADD COLUMN "sourceId" TEXT;

ALTER TABLE "DebtPayment" ADD COLUMN "transactionId" TEXT;

ALTER TABLE "RecurringBill" ADD COLUMN "defaultCategoryId" TEXT;
ALTER TABLE "RecurringBill" ADD COLUMN "icon" TEXT NOT NULL DEFAULT 'repeat';

ALTER TABLE "RecurringBillPayment" ADD COLUMN "transactionId" TEXT;

UPDATE "Category"
SET "kind" = 'income'
WHERE lower("name") IN ('sueldo', 'devolución', 'devolucion', 'descuento');

UPDATE "PaymentMethod"
SET "type" = CASE
  WHEN lower("name") LIKE '%credito%' OR lower("name") LIKE '%crédito%' OR lower("name") LIKE '%visa%' OR lower("name") LIKE '%master%' THEN 'credit'::"PaymentMethodType"
  WHEN lower("name") LIKE '%debito%' OR lower("name") LIKE '%débito%' THEN 'debit'::"PaymentMethodType"
  WHEN lower("name") LIKE '%mercado%' OR lower("name") LIKE '%billetera%' THEN 'wallet'::"PaymentMethodType"
  WHEN lower("name") LIKE '%transfer%' THEN 'transfer'::"PaymentMethodType"
  ELSE 'cash'::"PaymentMethodType"
END;

CREATE UNIQUE INDEX "Bank_householdId_name_key" ON "Bank"("householdId", "name");
CREATE INDEX "Bank_householdId_name_idx" ON "Bank"("householdId", "name");
DROP INDEX IF EXISTS "Category_householdId_isActive_name_idx";
CREATE INDEX "Category_householdId_isActive_kind_sortOrder_idx" ON "Category"("householdId", "isActive", "kind", "sortOrder");
CREATE INDEX "PaymentMethod_householdId_bankId_idx" ON "PaymentMethod"("householdId", "bankId");
CREATE INDEX "Transaction_householdId_sourceType_sourceId_idx" ON "Transaction"("householdId", "sourceType", "sourceId");
CREATE INDEX "DebtPayment_householdId_transactionId_idx" ON "DebtPayment"("householdId", "transactionId");
CREATE INDEX "RecurringBill_householdId_defaultCategoryId_idx" ON "RecurringBill"("householdId", "defaultCategoryId");
CREATE INDEX "RecurringBillPayment_householdId_transactionId_idx" ON "RecurringBillPayment"("householdId", "transactionId");

ALTER TABLE "Bank" ADD CONSTRAINT "Bank_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DebtPayment" ADD CONSTRAINT "DebtPayment_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RecurringBill" ADD CONSTRAINT "RecurringBill_defaultCategoryId_fkey" FOREIGN KEY ("defaultCategoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RecurringBillPayment" ADD CONSTRAINT "RecurringBillPayment_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
