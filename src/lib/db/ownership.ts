import "server-only";

import { prisma } from "@/lib/db";

type OwnedModel = "category" | "paymentMethod" | "account" | "transaction" | "debt" | "recurringBill";

async function findOwned(model: OwnedModel, id: string, householdId: string) {
  switch (model) {
    case "category":
      return prisma.category.findFirst({ where: { id, householdId, deletedAt: null }, select: { id: true } });
    case "paymentMethod":
      return prisma.paymentMethod.findFirst({ where: { id, householdId, deletedAt: null }, select: { id: true } });
    case "account":
      return prisma.account.findFirst({ where: { id, householdId, deletedAt: null }, select: { id: true } });
    case "transaction":
      return prisma.transaction.findFirst({ where: { id, householdId, deletedAt: null }, select: { id: true } });
    case "debt":
      return prisma.debt.findFirst({ where: { id, householdId, deletedAt: null }, select: { id: true } });
    case "recurringBill":
      return prisma.recurringBill.findFirst({ where: { id, householdId, deletedAt: null }, select: { id: true } });
  }
}

export async function assertOwnedResource(model: OwnedModel, id: string, householdId: string) {
  const row = await findOwned(model, id, householdId);
  if (!row) {
    throw new Error("No encontramos ese registro dentro de tu hogar.");
  }
  return row;
}

export async function assertOptionalOwnedResource(model: OwnedModel, id: string | null, householdId: string) {
  if (!id) return null;
  await assertOwnedResource(model, id, householdId);
  return id;
}
