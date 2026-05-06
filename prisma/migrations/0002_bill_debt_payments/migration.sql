ALTER TABLE "RecurringBill" ALTER COLUMN "amount" SET DEFAULT 0;

CREATE TABLE "DebtPayment" (
  "id" TEXT NOT NULL,
  "householdId" TEXT NOT NULL,
  "debtId" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "amount" DECIMAL(12, 2) NOT NULL,
  "notes" TEXT,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "DebtPayment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RecurringBillPayment" (
  "id" TEXT NOT NULL,
  "householdId" TEXT NOT NULL,
  "recurringBillId" TEXT NOT NULL,
  "paymentMethodId" TEXT,
  "issuedAt" DATE,
  "dueDate" DATE NOT NULL,
  "paidAt" DATE,
  "amount" DECIMAL(12, 2) NOT NULL,
  "notes" TEXT,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "RecurringBillPayment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DebtPayment_householdId_debtId_date_idx" ON "DebtPayment"("householdId", "debtId", "date");
CREATE INDEX "RecurringBillPayment_householdId_recurringBillId_dueDate_idx" ON "RecurringBillPayment"("householdId", "recurringBillId", "dueDate");
CREATE INDEX "RecurringBillPayment_householdId_paidAt_idx" ON "RecurringBillPayment"("householdId", "paidAt");

ALTER TABLE "DebtPayment" ADD CONSTRAINT "DebtPayment_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DebtPayment" ADD CONSTRAINT "DebtPayment_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES "Debt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecurringBillPayment" ADD CONSTRAINT "RecurringBillPayment_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecurringBillPayment" ADD CONSTRAINT "RecurringBillPayment_recurringBillId_fkey" FOREIGN KEY ("recurringBillId") REFERENCES "RecurringBill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecurringBillPayment" ADD CONSTRAINT "RecurringBillPayment_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;
