"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireHousehold, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { seedHousehold } from "@/lib/seed-household";
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

async function validateScopedResource<T extends { id: string; householdId: string }>(
  loader: () => Promise<T | null>,
  householdId: string,
) {
  const row = await loader();
  if (!row || row.householdId !== householdId) {
    throw new Error("No encontramos ese registro dentro de tu hogar.");
  }
  return row;
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

  redirect("/?message=Tu hogar ya está listo para empezar.");
}

export async function saveCategoryAction(formData: FormData) {
  const { household } = await requireHousehold();
  const parsed = categorySchema.safeParse({
    id: optionalString(getString(formData, "id")),
    name: getString(formData, "name"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    redirect(`/categorias?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "No se pudo guardar la categoría.")}`);
  }

  if (parsed.data.id) {
    await validateScopedResource(
      () => prisma.category.findUnique({ where: { id: parsed.data.id! } }),
      household.id,
    );
    await prisma.category.update({
      where: { id: parsed.data.id },
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

  revalidatePath("/categorias");
  revalidatePath("/");
}

export async function deleteCategoryAction(formData: FormData) {
  const { household } = await requireHousehold();
  const id = getString(formData, "id");
  await validateScopedResource(() => prisma.category.findUnique({ where: { id } }), household.id);
  const usageCount = await prisma.transaction.count({ where: { householdId: household.id, categoryId: id } });
  if (usageCount > 0) {
    redirect("/categorias?error=Esa categoría ya tiene movimientos. Desactívala en lugar de borrarla.");
  }
  await prisma.category.delete({ where: { id } });
  revalidatePath("/categorias");
}

export async function savePaymentMethodAction(formData: FormData) {
  const { household } = await requireHousehold();
  const parsed = paymentMethodSchema.safeParse({
    id: optionalString(getString(formData, "id")),
    name: getString(formData, "name"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    redirect(`/medios-de-pago?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "No se pudo guardar el medio de pago.")}`);
  }

  if (parsed.data.id) {
    await validateScopedResource(
      () => prisma.paymentMethod.findUnique({ where: { id: parsed.data.id! } }),
      household.id,
    );
    await prisma.paymentMethod.update({
      where: { id: parsed.data.id },
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

  revalidatePath("/medios-de-pago");
  revalidatePath("/");
}

export async function deletePaymentMethodAction(formData: FormData) {
  const { household } = await requireHousehold();
  const id = getString(formData, "id");
  await validateScopedResource(() => prisma.paymentMethod.findUnique({ where: { id } }), household.id);
  const [txCount, billCount] = await Promise.all([
    prisma.transaction.count({ where: { householdId: household.id, paymentMethodId: id } }),
    prisma.recurringBill.count({ where: { householdId: household.id, paymentMethodId: id } }),
  ]);
  if (txCount > 0 || billCount > 0) {
    redirect("/medios-de-pago?error=Ese medio ya está en uso. Desactívalo en lugar de borrarlo.");
  }
  await prisma.paymentMethod.delete({ where: { id } });
  revalidatePath("/medios-de-pago");
}

export async function saveAccountAction(formData: FormData) {
  const { household } = await requireHousehold();
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
    await validateScopedResource(() => prisma.account.findUnique({ where: { id: parsed.data.id! } }), household.id);
    await prisma.account.update({
      where: { id: parsed.data.id },
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

  revalidatePath("/cuentas");
  revalidatePath("/movimientos");
}

export async function deleteAccountAction(formData: FormData) {
  const { household } = await requireHousehold();
  const id = getString(formData, "id");
  await validateScopedResource(() => prisma.account.findUnique({ where: { id } }), household.id);
  const usageCount = await prisma.transaction.count({ where: { householdId: household.id, accountId: id } });
  if (usageCount > 0) {
    redirect("/cuentas?error=La cuenta ya tiene movimientos. Desactívala en lugar de borrarla.");
  }
  await prisma.account.delete({ where: { id } });
  revalidatePath("/cuentas");
}

export async function saveTransactionAction(formData: FormData) {
  const { household } = await requireHousehold();
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
    await validateScopedResource(() => prisma.transaction.findUnique({ where: { id: parsed.data.id! } }), household.id);
    await prisma.transaction.update({
      where: { id: parsed.data.id },
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

  revalidatePath("/movimientos");
  revalidatePath("/");
}

export async function deleteTransactionAction(formData: FormData) {
  const { household } = await requireHousehold();
  const id = getString(formData, "id");
  await validateScopedResource(() => prisma.transaction.findUnique({ where: { id } }), household.id);
  await prisma.transaction.delete({ where: { id } });
  revalidatePath("/movimientos");
  revalidatePath("/");
}

export async function saveDebtAction(formData: FormData) {
  const { household } = await requireHousehold();
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
    await validateScopedResource(() => prisma.debt.findUnique({ where: { id: parsed.data.id! } }), household.id);
    await prisma.debt.update({
      where: { id: parsed.data.id },
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

  revalidatePath("/deudas");
}

export async function deleteDebtAction(formData: FormData) {
  const { household } = await requireHousehold();
  const id = getString(formData, "id");
  await validateScopedResource(() => prisma.debt.findUnique({ where: { id } }), household.id);
  await prisma.debt.delete({ where: { id } });
  revalidatePath("/deudas");
}

export async function saveRecurringBillAction(formData: FormData) {
  const { household } = await requireHousehold();
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
    await validateScopedResource(() => prisma.recurringBill.findUnique({ where: { id: parsed.data.id! } }), household.id);
    await prisma.recurringBill.update({
      where: { id: parsed.data.id },
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

  revalidatePath("/gastos-fijos");
}

export async function deleteRecurringBillAction(formData: FormData) {
  const { household } = await requireHousehold();
  const id = getString(formData, "id");
  await validateScopedResource(() => prisma.recurringBill.findUnique({ where: { id } }), household.id);
  await prisma.recurringBill.delete({ where: { id } });
  revalidatePath("/gastos-fijos");
}
