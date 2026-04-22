import { DEFAULT_ACCOUNTS, DEFAULT_CATEGORIES, DEFAULT_PAYMENT_METHODS } from "@/lib/catalog";
import type { Prisma, PrismaClient } from "@prisma/client";

type SeedDb = PrismaClient | Prisma.TransactionClient;

export async function seedHousehold(db: SeedDb, householdId: string) {
  await db.category.createMany({
    data: DEFAULT_CATEGORIES.map((name) => ({
      householdId,
      name,
    })),
    skipDuplicates: true,
  });

  await db.paymentMethod.createMany({
    data: DEFAULT_PAYMENT_METHODS.map((name) => ({
      householdId,
      name,
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
