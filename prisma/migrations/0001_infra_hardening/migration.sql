-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('owner');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('cash', 'bank', 'wallet');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('expense', 'income');

-- CreateEnum
CREATE TYPE "DebtDirection" AS ENUM ('we_owe', 'they_owe_us');

-- CreateEnum
CREATE TYPE "AuditResult" AS ENUM ('success', 'failure');

-- CreateTable
CREATE TABLE "Household" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseCurrency" TEXT NOT NULL DEFAULT 'ARS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Household_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "householdId" TEXT,
    "requestId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "result" "AuditResult" NOT NULL DEFAULT 'success',
    "before" JSONB,
    "after" JSONB,
    "errorCode" TEXT,
    "ipHash" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitBucket" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "resetAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "authUserId" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "role" "MembershipRole" NOT NULL DEFAULT 'owner',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AccountType" NOT NULL DEFAULT 'cash',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "accountId" TEXT,
    "categoryId" TEXT,
    "paymentMethodId" TEXT,
    "date" DATE NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "type" "TransactionType" NOT NULL,
    "detail" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Debt" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "direction" "DebtDirection" NOT NULL DEFAULT 'we_owe',
    "originalAmount" DECIMAL(12,2) NOT NULL,
    "remainingBalance" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Debt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringBill" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "paymentMethodId" TEXT,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "dueDay" INTEGER NOT NULL,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecurringBill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_householdId_createdAt_idx" ON "AuditLog"("householdId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_requestId_idx" ON "AuditLog"("requestId");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimitBucket_key_key" ON "RateLimitBucket"("key");

-- CreateIndex
CREATE INDEX "RateLimitBucket_resetAt_idx" ON "RateLimitBucket"("resetAt");

-- CreateIndex
CREATE INDEX "Membership_authUserId_idx" ON "Membership"("authUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_authUserId_householdId_key" ON "Membership"("authUserId", "householdId");

-- CreateIndex
CREATE INDEX "Category_householdId_isActive_name_idx" ON "Category"("householdId", "isActive", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_householdId_name_key" ON "Category"("householdId", "name");

-- CreateIndex
CREATE INDEX "PaymentMethod_householdId_isActive_name_idx" ON "PaymentMethod"("householdId", "isActive", "name");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_householdId_name_key" ON "PaymentMethod"("householdId", "name");

-- CreateIndex
CREATE INDEX "Account_householdId_isActive_name_idx" ON "Account"("householdId", "isActive", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Account_householdId_name_key" ON "Account"("householdId", "name");

-- CreateIndex
CREATE INDEX "Transaction_householdId_date_idx" ON "Transaction"("householdId", "date");

-- CreateIndex
CREATE INDEX "Transaction_householdId_type_date_idx" ON "Transaction"("householdId", "type", "date");

-- CreateIndex
CREATE INDEX "Transaction_householdId_categoryId_date_idx" ON "Transaction"("householdId", "categoryId", "date");

-- CreateIndex
CREATE INDEX "Debt_householdId_isActive_idx" ON "Debt"("householdId", "isActive");

-- CreateIndex
CREATE INDEX "Debt_householdId_isActive_createdAt_idx" ON "Debt"("householdId", "isActive", "createdAt");

-- CreateIndex
CREATE INDEX "RecurringBill_householdId_isActive_idx" ON "RecurringBill"("householdId", "isActive");

-- CreateIndex
CREATE INDEX "RecurringBill_householdId_isActive_dueDay_idx" ON "RecurringBill"("householdId", "isActive", "dueDay");

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringBill" ADD CONSTRAINT "RecurringBill_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringBill" ADD CONSTRAINT "RecurringBill_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated;
  END IF;
END
$$;

ALTER TABLE "Household" ADD CONSTRAINT "Household_baseCurrency_check" CHECK ("baseCurrency" = 'ARS');
ALTER TABLE "RateLimitBucket" ADD CONSTRAINT "RateLimitBucket_count_check" CHECK ("count" >= 0);
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_amount_check" CHECK ("amount" > 0);
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_originalAmount_check" CHECK ("originalAmount" > 0);
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_remainingBalance_check" CHECK ("remainingBalance" >= 0 AND "remainingBalance" <= "originalAmount");
ALTER TABLE "RecurringBill" ADD CONSTRAINT "RecurringBill_amount_check" CHECK ("amount" > 0);
ALTER TABLE "RecurringBill" ADD CONSTRAINT "RecurringBill_dueDay_check" CHECK ("dueDay" BETWEEN 1 AND 31);

ALTER TABLE "Household" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Membership" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PaymentMethod" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Debt" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RecurringBill" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RateLimitBucket" ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.current_user_household_ids()
RETURNS SETOF text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT "householdId"
  FROM "Membership"
  WHERE "authUserId" = coalesce(
    nullif(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub', ''),
    nullif(current_setting('jwt.claims.sub', true), '')
  )
$$;

CREATE POLICY "membership_select_own" ON "Membership"
  FOR SELECT TO authenticated
  USING ("authUserId" = coalesce(
    nullif(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub', ''),
    nullif(current_setting('jwt.claims.sub', true), '')
  ));

CREATE POLICY "membership_insert_own" ON "Membership"
  FOR INSERT TO authenticated
  WITH CHECK ("authUserId" = coalesce(
    nullif(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub', ''),
    nullif(current_setting('jwt.claims.sub', true), '')
  ));

CREATE POLICY "household_select_member" ON "Household"
  FOR SELECT TO authenticated
  USING (id IN (SELECT public.current_user_household_ids()));

CREATE POLICY "household_insert_authenticated" ON "Household"
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "household_update_member" ON "Household"
  FOR UPDATE TO authenticated
  USING (id IN (SELECT public.current_user_household_ids()))
  WITH CHECK (id IN (SELECT public.current_user_household_ids()));

CREATE POLICY "household_delete_member" ON "Household"
  FOR DELETE TO authenticated
  USING (id IN (SELECT public.current_user_household_ids()));

CREATE POLICY "category_member_access" ON "Category"
  FOR ALL TO authenticated
  USING ("householdId" IN (SELECT public.current_user_household_ids()))
  WITH CHECK ("householdId" IN (SELECT public.current_user_household_ids()));

CREATE POLICY "payment_method_member_access" ON "PaymentMethod"
  FOR ALL TO authenticated
  USING ("householdId" IN (SELECT public.current_user_household_ids()))
  WITH CHECK ("householdId" IN (SELECT public.current_user_household_ids()));

CREATE POLICY "account_member_access" ON "Account"
  FOR ALL TO authenticated
  USING ("householdId" IN (SELECT public.current_user_household_ids()))
  WITH CHECK ("householdId" IN (SELECT public.current_user_household_ids()));

CREATE POLICY "transaction_member_access" ON "Transaction"
  FOR ALL TO authenticated
  USING ("householdId" IN (SELECT public.current_user_household_ids()))
  WITH CHECK ("householdId" IN (SELECT public.current_user_household_ids()));

CREATE POLICY "debt_member_access" ON "Debt"
  FOR ALL TO authenticated
  USING ("householdId" IN (SELECT public.current_user_household_ids()))
  WITH CHECK ("householdId" IN (SELECT public.current_user_household_ids()));

CREATE POLICY "recurring_bill_member_access" ON "RecurringBill"
  FOR ALL TO authenticated
  USING ("householdId" IN (SELECT public.current_user_household_ids()))
  WITH CHECK ("householdId" IN (SELECT public.current_user_household_ids()));
