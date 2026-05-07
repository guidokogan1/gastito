import { DEFAULT_ACCOUNTS, DEFAULT_BANKS, DEFAULT_CATEGORIES, DEFAULT_INCOME_CATEGORIES, DEFAULT_PAYMENT_METHODS } from "@/lib/catalog";
import type { Prisma, PrismaClient } from "@prisma/client";

type SeedDb = PrismaClient | Prisma.TransactionClient;

export async function seedHousehold(db: SeedDb, householdId: string) {
  await db.bank.createMany({
    data: DEFAULT_BANKS.map((bank) => ({
      householdId,
      name: bank.name,
      color: bank.color,
    })),
    skipDuplicates: true,
  });

  await db.category.createMany({
    data: [...DEFAULT_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES].map((category) => ({
      householdId,
      ...category,
    })),
    skipDuplicates: true,
  });

  await db.paymentMethod.createMany({
    data: DEFAULT_PAYMENT_METHODS.map((method) => ({
      householdId,
      ...method,
    })),
    skipDuplicates: true,
  });

  await db.account.createMany({
    data: DEFAULT_ACCOUNTS.map((account) => ({
      householdId,
      name: account.name,
      type: account.type,
    })),
    skipDuplicates: true,
  });
}
