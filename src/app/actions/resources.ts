"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { assertOptionalOwnedResource, assertOwnedResource } from "@/lib/db/ownership";
import { seedHousehold } from "@/lib/seed-household";
import { recordAuditEvent, requireMutationContext } from "@/lib/security";
import {
  accountSchema,
  categorySchema,
  debtSchema,
  onboardingSchema,
  paymentMethodSchema,
  recurringBillSchema,
  transactionSchema,
} from "@/lib/validators";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function optionalString(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toNullableId(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function withMessage(path: string, value: string) {
  return `${path}?message=${encodeURIComponent(value)}`;
}

export async function completeOnboardingAction(formData: FormData) {
  const current = await requireUser();
  if (current.household) redirect("/");

  const parsed = onboardingSchema.safeParse({
    householdName: getString(formData, "householdName"),
  });

  if (!parsed.success) {
    redirect(`/onboarding?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "No se pudo crear el hogar.")}`);
  }

  const existingMembership = await prisma.membership.findFirst({
    where: { authUserId: current.user.id },
  });

  if (existingMembership) {
    redirect("/?message=Tu hogar ya estaba listo.");
  }

  const household = await prisma.$transaction(async (tx) => {
    const createdHousehold = await tx.household.create({
      data: {
        name: parsed.data.householdName,
      },
    });

    await tx.membership.create({
      data: {
        authUserId: current.user.id,
        householdId: createdHousehold.id,
        role: "owner",
      },
    });

    await seedHousehold(tx, createdHousehold.id);
    return createdHousehold;
  });

  await recordAuditEvent({
    userId: current.user.id,
    householdId: household.id,
    action: "onboarding.complete",
    targetType: "household",
    targetId: household.id,
    after: { householdId: household.id },
  });

  redirect("/?message=Tu hogar ya está listo para empezar.");
}

export async function saveCategoryAction(formData: FormData) {
  const { user, household, requestId } = await requireMutationContext("category.save");
  const parsed = categorySchema.safeParse({
    id: optionalString(getString(formData, "id")),
    name: getString(formData, "name"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    redirect(`/categorias?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "No se pudo guardar la categoría.")}`);
  }

  if (parsed.data.id) {
    await assertOwnedResource("category", parsed.data.id, household.id);
    await prisma.category.updateMany({
      where: { id: parsed.data.id, householdId: household.id, deletedAt: null },
      data: {
        name: parsed.data.name,
        isActive: parsed.data.isActive,
      },
    });
  } else {
    await prisma.category.create({
      data: {
        householdId: household.id,
        name: parsed.data.name,
        isActive: parsed.data.isActive,
      },
    });
  }

  await recordAuditEvent({
    userId: user.id,
    householdId: household.id,
    requestId,
    action: parsed.data.id ? "category.update" : "category.create",
    targetType: "category",
    targetId: parsed.data.id,
    after: { name: parsed.data.name, isActive: parsed.data.isActive },
  });

  revalidatePath("/categorias");
  revalidatePath("/");
  redirect(
    withMessage(
      "/categorias",
      parsed.data.id ? "Categoría actualizada." : "Categoría creada.",
    ),
  );
}

export async function deleteCategoryAction(formData: FormData) {
  const { user, household, requestId } = await requireMutationContext("category.delete");
  const id = getString(formData, "id");
  await assertOwnedResource("category", id, household.id);
  const usageCount = await prisma.transaction.count({ where: { householdId: household.id, categoryId: id, deletedAt: null } });
  if (usageCount > 0) {
    redirect("/categorias?error=Esa categoría ya tiene movimientos. Desactívala en lugar de borrarla.");
  }
  await prisma.category.updateMany({ where: { id, householdId: household.id }, data: { deletedAt: new Date(), isActive: false } });
  await recordAuditEvent({ userId: user.id, householdId: household.id, requestId, action: "category.delete", targetType: "category", targetId: id });
  revalidatePath("/categorias");
  redirect(withMessage("/categorias", "Categoría borrada."));
}

export async function savePaymentMethodAction(formData: FormData) {
  const { user, household, requestId } = await requireMutationContext("paymentMethod.save");
  const parsed = paymentMethodSchema.safeParse({
    id: optionalString(getString(formData, "id")),
    name: getString(formData, "name"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    redirect(`/medios-de-pago?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "No se pudo guardar el medio de pago.")}`);
  }

  if (parsed.data.id) {
    await assertOwnedResource("paymentMethod", parsed.data.id, household.id);
    await prisma.paymentMethod.updateMany({
      where: { id: parsed.data.id, householdId: household.id, deletedAt: null },
      data: {
        name: parsed.data.name,
        isActive: parsed.data.isActive,
      },
    });
  } else {
    await prisma.paymentMethod.create({
      data: {
        householdId: household.id,
        name: parsed.data.name,
        isActive: parsed.data.isActive,
      },
    });
  }

  await recordAuditEvent({
    userId: user.id,
    householdId: household.id,
    requestId,
    action: parsed.data.id ? "payment_method.update" : "payment_method.create",
    targetType: "paymentMethod",
    targetId: parsed.data.id,
    after: { name: parsed.data.name, isActive: parsed.data.isActive },
  });

  revalidatePath("/medios-de-pago");
  revalidatePath("/");
  redirect(
    withMessage(
      "/medios-de-pago",
      parsed.data.id ? "Medio de pago actualizado." : "Medio de pago creado.",
    ),
  );
}

export async function deletePaymentMethodAction(formData: FormData) {
  const { user, household, requestId } = await requireMutationContext("paymentMethod.delete");
  const id = getString(formData, "id");
  await assertOwnedResource("paymentMethod", id, household.id);
  const [txCount, billCount] = await Promise.all([
    prisma.transaction.count({ where: { householdId: household.id, paymentMethodId: id, deletedAt: null } }),
    prisma.recurringBill.count({ where: { householdId: household.id, paymentMethodId: id, deletedAt: null } }),
  ]);
  if (txCount > 0 || billCount > 0) {
    redirect("/medios-de-pago?error=Ese medio ya está en uso. Desactívalo en lugar de borrarlo.");
  }
  await prisma.paymentMethod.updateMany({ where: { id, householdId: household.id }, data: { deletedAt: new Date(), isActive: false } });
  await recordAuditEvent({ userId: user.id, householdId: household.id, requestId, action: "payment_method.delete", targetType: "paymentMethod", targetId: id });
  revalidatePath("/medios-de-pago");
  redirect(withMessage("/medios-de-pago", "Medio de pago borrado."));
}

export async function saveAccountAction(formData: FormData) {
  const { user, household, requestId } = await requireMutationContext("account.save");
  const parsed = accountSchema.safeParse({
    id: optionalString(getString(formData, "id")),
    name: getString(formData, "name"),
    type: getString(formData, "type"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    redirect(`/cuentas?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "No se pudo guardar la cuenta.")}`);
  }

  if (parsed.data.id) {
    await assertOwnedResource("account", parsed.data.id, household.id);
    await prisma.account.updateMany({
      where: { id: parsed.data.id, householdId: household.id, deletedAt: null },
      data: {
        name: parsed.data.name,
        type: parsed.data.type,
        isActive: parsed.data.isActive,
      },
    });
  } else {
    await prisma.account.create({
      data: {
        householdId: household.id,
        name: parsed.data.name,
        type: parsed.data.type,
        isActive: parsed.data.isActive,
      },
    });
  }

  await recordAuditEvent({
    userId: user.id,
    householdId: household.id,
    requestId,
    action: parsed.data.id ? "account.update" : "account.create",
    targetType: "account",
    targetId: parsed.data.id,
    after: { name: parsed.data.name, type: parsed.data.type, isActive: parsed.data.isActive },
  });

  revalidatePath("/cuentas");
  revalidatePath("/movimientos");
  redirect(
    withMessage(
      "/cuentas",
      parsed.data.id ? "Cuenta actualizada." : "Cuenta creada.",
    ),
  );
}

export async function deleteAccountAction(formData: FormData) {
  const { user, household, requestId } = await requireMutationContext("account.delete");
  const id = getString(formData, "id");
  await assertOwnedResource("account", id, household.id);
  const usageCount = await prisma.transaction.count({ where: { householdId: household.id, accountId: id, deletedAt: null } });
  if (usageCount > 0) {
    redirect("/cuentas?error=La cuenta ya tiene movimientos. Desactívala en lugar de borrarla.");
  }
  await prisma.account.updateMany({ where: { id, householdId: household.id }, data: { deletedAt: new Date(), isActive: false } });
  await recordAuditEvent({ userId: user.id, householdId: household.id, requestId, action: "account.delete", targetType: "account", targetId: id });
  revalidatePath("/cuentas");
  redirect(withMessage("/cuentas", "Cuenta borrada."));
}

export async function saveTransactionAction(formData: FormData) {
  const { user, household, requestId } = await requireMutationContext("transaction.save");
  const parsed = transactionSchema.safeParse({
    id: optionalString(getString(formData, "id")),
    date: getString(formData, "date"),
    amount: getString(formData, "amount"),
    type: getString(formData, "type"),
    accountId: optionalString(getString(formData, "accountId")),
    categoryId: optionalString(getString(formData, "categoryId")),
    paymentMethodId: optionalString(getString(formData, "paymentMethodId")),
    detail: optionalString(getString(formData, "detail")),
  });

  if (!parsed.success) {
    redirect(`/movimientos?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "No se pudo guardar el movimiento.")}`);
  }

  if (parsed.data.id) {
    await assertOwnedResource("transaction", parsed.data.id, household.id);
    await assertOptionalOwnedResource("account", toNullableId(parsed.data.accountId ?? ""), household.id);
    await assertOptionalOwnedResource("category", toNullableId(parsed.data.categoryId ?? ""), household.id);
    await assertOptionalOwnedResource("paymentMethod", toNullableId(parsed.data.paymentMethodId ?? ""), household.id);
    await prisma.transaction.updateMany({
      where: { id: parsed.data.id, householdId: household.id, deletedAt: null },
      data: {
        date: new Date(parsed.data.date),
        amount: parsed.data.amount,
        type: parsed.data.type,
        detail: parsed.data.detail,
        accountId: toNullableId(parsed.data.accountId ?? ""),
        categoryId: toNullableId(parsed.data.categoryId ?? ""),
        paymentMethodId: toNullableId(parsed.data.paymentMethodId ?? ""),
      },
    });
  } else {
    await assertOptionalOwnedResource("account", toNullableId(parsed.data.accountId ?? ""), household.id);
    await assertOptionalOwnedResource("category", toNullableId(parsed.data.categoryId ?? ""), household.id);
    await assertOptionalOwnedResource("paymentMethod", toNullableId(parsed.data.paymentMethodId ?? ""), household.id);
    await prisma.transaction.create({
      data: {
        householdId: household.id,
        date: new Date(parsed.data.date),
        amount: parsed.data.amount,
        type: parsed.data.type,
        detail: parsed.data.detail,
        accountId: toNullableId(parsed.data.accountId ?? ""),
        categoryId: toNullableId(parsed.data.categoryId ?? ""),
        paymentMethodId: toNullableId(parsed.data.paymentMethodId ?? ""),
      },
    });
  }

  await recordAuditEvent({
    userId: user.id,
    householdId: household.id,
    requestId,
    action: parsed.data.id ? "transaction.update" : "transaction.create",
    targetType: "transaction",
    targetId: parsed.data.id,
    after: { amount: parsed.data.amount, type: parsed.data.type, date: parsed.data.date },
  });

  revalidatePath("/movimientos");
  revalidatePath("/");
  redirect(
    withMessage(
      "/movimientos",
      parsed.data.id ? "Movimiento actualizado." : "Movimiento creado.",
    ),
  );
}

export async function deleteTransactionAction(formData: FormData) {
  const { user, household, requestId } = await requireMutationContext("transaction.delete");
  const id = getString(formData, "id");
  await assertOwnedResource("transaction", id, household.id);
  await prisma.transaction.updateMany({ where: { id, householdId: household.id }, data: { deletedAt: new Date() } });
  await recordAuditEvent({ userId: user.id, householdId: household.id, requestId, action: "transaction.delete", targetType: "transaction", targetId: id });
  revalidatePath("/movimientos");
  revalidatePath("/");
  redirect(withMessage("/movimientos", "Movimiento borrado."));
}

export async function saveDebtAction(formData: FormData) {
  const { user, household, requestId } = await requireMutationContext("debt.save");
  const parsed = debtSchema.safeParse({
    id: optionalString(getString(formData, "id")),
    entityName: getString(formData, "entityName"),
    direction: getString(formData, "direction"),
    originalAmount: getString(formData, "originalAmount"),
    remainingBalance: getString(formData, "remainingBalance"),
    notes: optionalString(getString(formData, "notes")),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    redirect(`/deudas?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "No se pudo guardar la deuda.")}`);
  }

  if (parsed.data.id) {
    await assertOwnedResource("debt", parsed.data.id, household.id);
    await prisma.debt.updateMany({
      where: { id: parsed.data.id, householdId: household.id, deletedAt: null },
      data: {
        entityName: parsed.data.entityName,
        direction: parsed.data.direction,
        originalAmount: parsed.data.originalAmount,
        remainingBalance: parsed.data.remainingBalance,
        notes: parsed.data.notes,
        isActive: parsed.data.isActive,
      },
    });
  } else {
    await prisma.debt.create({
      data: {
        householdId: household.id,
        entityName: parsed.data.entityName,
        direction: parsed.data.direction,
        originalAmount: parsed.data.originalAmount,
        remainingBalance: parsed.data.remainingBalance,
        notes: parsed.data.notes,
        isActive: parsed.data.isActive,
      },
    });
  }

  await recordAuditEvent({
    userId: user.id,
    householdId: household.id,
    requestId,
    action: parsed.data.id ? "debt.update" : "debt.create",
    targetType: "debt",
    targetId: parsed.data.id,
    after: { entityName: parsed.data.entityName, direction: parsed.data.direction, remainingBalance: parsed.data.remainingBalance },
  });

  revalidatePath("/deudas");
  redirect(withMessage("/deudas", parsed.data.id ? "Deuda actualizada." : "Deuda creada."));
}

export async function deleteDebtAction(formData: FormData) {
  const { user, household, requestId } = await requireMutationContext("debt.delete");
  const id = getString(formData, "id");
  await assertOwnedResource("debt", id, household.id);
  await prisma.debt.updateMany({ where: { id, householdId: household.id }, data: { deletedAt: new Date(), isActive: false } });
  await recordAuditEvent({ userId: user.id, householdId: household.id, requestId, action: "debt.delete", targetType: "debt", targetId: id });
  revalidatePath("/deudas");
  redirect(withMessage("/deudas", "Deuda borrada."));
}

export async function saveRecurringBillAction(formData: FormData) {
  const { user, household, requestId } = await requireMutationContext("recurringBill.save");
  const parsed = recurringBillSchema.safeParse({
    id: optionalString(getString(formData, "id")),
    name: getString(formData, "name"),
    amount: getString(formData, "amount"),
    dueDay: getString(formData, "dueDay"),
    notes: optionalString(getString(formData, "notes")),
    paymentMethodId: optionalString(getString(formData, "paymentMethodId")),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    redirect(`/gastos-fijos?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "No se pudo guardar el gasto fijo.")}`);
  }

  if (parsed.data.id) {
    await assertOwnedResource("recurringBill", parsed.data.id, household.id);
    await assertOptionalOwnedResource("paymentMethod", toNullableId(parsed.data.paymentMethodId ?? ""), household.id);
    await prisma.recurringBill.updateMany({
      where: { id: parsed.data.id, householdId: household.id, deletedAt: null },
      data: {
        name: parsed.data.name,
        amount: parsed.data.amount,
        dueDay: parsed.data.dueDay,
        notes: parsed.data.notes,
        paymentMethodId: toNullableId(parsed.data.paymentMethodId ?? ""),
        isActive: parsed.data.isActive,
      },
    });
  } else {
    await assertOptionalOwnedResource("paymentMethod", toNullableId(parsed.data.paymentMethodId ?? ""), household.id);
    await prisma.recurringBill.create({
      data: {
        householdId: household.id,
        name: parsed.data.name,
        amount: parsed.data.amount,
        dueDay: parsed.data.dueDay,
        notes: parsed.data.notes,
        paymentMethodId: toNullableId(parsed.data.paymentMethodId ?? ""),
        isActive: parsed.data.isActive,
      },
    });
  }

  await recordAuditEvent({
    userId: user.id,
    householdId: household.id,
    requestId,
    action: parsed.data.id ? "recurring_bill.update" : "recurring_bill.create",
    targetType: "recurringBill",
    targetId: parsed.data.id,
    after: { name: parsed.data.name, amount: parsed.data.amount, dueDay: parsed.data.dueDay },
  });

  revalidatePath("/gastos-fijos");
  redirect(
    withMessage(
      "/gastos-fijos",
      parsed.data.id ? "Gasto fijo actualizado." : "Gasto fijo creado.",
    ),
  );
}

export async function deleteRecurringBillAction(formData: FormData) {
  const { user, household, requestId } = await requireMutationContext("recurringBill.delete");
  const id = getString(formData, "id");
  await assertOwnedResource("recurringBill", id, household.id);
  await prisma.recurringBill.updateMany({ where: { id, householdId: household.id }, data: { deletedAt: new Date(), isActive: false } });
  await recordAuditEvent({ userId: user.id, householdId: household.id, requestId, action: "recurring_bill.delete", targetType: "recurringBill", targetId: id });
  revalidatePath("/gastos-fijos");
  redirect(withMessage("/gastos-fijos", "Gasto fijo borrado."));
}
