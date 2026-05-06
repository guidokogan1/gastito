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
  debtPaymentSchema,
  debtSchema,
  onboardingSchema,
  paymentMethodSchema,
  recurringBillPaymentSchema,
  recurringBillSchema,
  transactionSchema,
} from "@/lib/validators";
import { toTitleCase } from "@/lib/text";

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

function toDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function withMessage(path: string, value: string) {
  return `${path}?message=${encodeURIComponent(value)}`;
}

export async function completeOnboardingAction(formData: FormData) {
  const current = await requireUser();
  if (current.household) redirect("/");

  const parsed = onboardingSchema.safeParse({
    householdName: toTitleCase(getString(formData, "householdName")),
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
  const originalAmount = getString(formData, "originalAmount");
  const paidAmount = optionalString(getString(formData, "paidAmount"));
  const remainingBalance = paidAmount
    ? String(Math.max(0, Number(originalAmount.replace(",", ".")) - Number(paidAmount.replace(",", "."))))
    : getString(formData, "remainingBalance");
  const parsed = debtSchema.safeParse({
    id: optionalString(getString(formData, "id")),
    entityName: getString(formData, "entityName"),
    direction: getString(formData, "direction"),
    originalAmount,
    remainingBalance,
    notes: optionalString(getString(formData, "notes")),
    isActive: true,
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

export async function saveDebtPaymentAction(formData: FormData) {
  const { user, household, requestId } = await requireMutationContext("debtPayment.save");
  const parsed = debtPaymentSchema.safeParse({
    id: optionalString(getString(formData, "id")),
    debtId: getString(formData, "debtId"),
    date: getString(formData, "date"),
    amount: getString(formData, "amount"),
    notes: optionalString(getString(formData, "notes")),
  });

  if (!parsed.success) {
    redirect(`/deudas?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "No se pudo guardar el pago.")}`);
  }

  await assertOwnedResource("debt", parsed.data.debtId, household.id);
  const amount = Number(parsed.data.amount);

  await prisma.$transaction(async (tx) => {
    if (parsed.data.id) {
      const previous = await tx.debtPayment.findFirst({
        where: { id: parsed.data.id, householdId: household.id, debtId: parsed.data.debtId, deletedAt: null },
        select: { amount: true },
      });
      if (!previous) throw new Error("No encontramos ese pago.");
      await tx.debtPayment.updateMany({
        where: { id: parsed.data.id, householdId: household.id, deletedAt: null },
        data: { date: toDate(parsed.data.date), amount: parsed.data.amount, notes: parsed.data.notes },
      });
      const delta = amount - Number(previous.amount);
      await tx.debt.updateMany({
        where: { id: parsed.data.debtId, householdId: household.id, deletedAt: null },
        data: { remainingBalance: { decrement: delta } },
      });
    } else {
      await tx.debtPayment.create({
        data: {
          householdId: household.id,
          debtId: parsed.data.debtId,
          date: toDate(parsed.data.date),
          amount: parsed.data.amount,
          notes: parsed.data.notes,
        },
      });
      await tx.debt.updateMany({
        where: { id: parsed.data.debtId, householdId: household.id, deletedAt: null },
        data: { remainingBalance: { decrement: amount } },
      });
    }
  });

  await recordAuditEvent({
    userId: user.id,
    householdId: household.id,
    requestId,
    action: parsed.data.id ? "debt_payment.update" : "debt_payment.create",
    targetType: "debtPayment",
    targetId: parsed.data.id,
  });

  revalidatePath("/deudas");
  revalidatePath("/");
  redirect(withMessage("/deudas", parsed.data.id ? "Pago actualizado." : "Pago registrado."));
}

export async function deleteDebtPaymentAction(formData: FormData) {
  const { user, household, requestId } = await requireMutationContext("debtPayment.delete");
  const id = getString(formData, "id");
  const payment = await prisma.debtPayment.findFirst({
    where: { id, householdId: household.id, deletedAt: null },
    select: { id: true, debtId: true, amount: true },
  });
  if (!payment) throw new Error("No encontramos ese pago.");
  await prisma.$transaction([
    prisma.debtPayment.updateMany({ where: { id, householdId: household.id }, data: { deletedAt: new Date() } }),
    prisma.debt.updateMany({ where: { id: payment.debtId, householdId: household.id }, data: { remainingBalance: { increment: Number(payment.amount) } } }),
  ]);
  await recordAuditEvent({ userId: user.id, householdId: household.id, requestId, action: "debt_payment.delete", targetType: "debtPayment", targetId: id });
  revalidatePath("/deudas");
  revalidatePath("/");
  redirect(withMessage("/deudas", "Pago borrado."));
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
    amount: optionalString(getString(formData, "amount")) ?? "0",
    dueDay: getString(formData, "dueDay"),
    notes: optionalString(getString(formData, "notes")),
    paymentMethodId: optionalString(getString(formData, "paymentMethodId")),
    isActive: true,
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

export async function saveRecurringBillPaymentAction(formData: FormData) {
  const { user, household, requestId } = await requireMutationContext("recurringBillPayment.save");
  const parsed = recurringBillPaymentSchema.safeParse({
    id: optionalString(getString(formData, "id")),
    recurringBillId: getString(formData, "recurringBillId"),
    amount: getString(formData, "amount"),
    issuedAt: optionalString(getString(formData, "issuedAt")),
    dueDate: getString(formData, "dueDate"),
    paidAt: optionalString(getString(formData, "paidAt")),
    paymentMethodId: optionalString(getString(formData, "paymentMethodId")),
    notes: optionalString(getString(formData, "notes")),
  });

  if (!parsed.success) {
    redirect(`/gastos-fijos?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "No se pudo guardar el pago.")}`);
  }

  await assertOwnedResource("recurringBill", parsed.data.recurringBillId, household.id);
  await assertOptionalOwnedResource("paymentMethod", toNullableId(parsed.data.paymentMethodId ?? ""), household.id);

  if (parsed.data.id) {
    await assertOwnedResource("recurringBillPayment", parsed.data.id, household.id);
    await prisma.recurringBillPayment.updateMany({
      where: { id: parsed.data.id, householdId: household.id, deletedAt: null },
      data: {
        amount: parsed.data.amount,
        issuedAt: parsed.data.issuedAt ? toDate(parsed.data.issuedAt) : null,
        dueDate: toDate(parsed.data.dueDate),
        paidAt: parsed.data.paidAt ? toDate(parsed.data.paidAt) : null,
        paymentMethodId: toNullableId(parsed.data.paymentMethodId ?? ""),
        notes: parsed.data.notes,
      },
    });
  } else {
    await prisma.recurringBillPayment.create({
      data: {
        householdId: household.id,
        recurringBillId: parsed.data.recurringBillId,
        amount: parsed.data.amount,
        issuedAt: parsed.data.issuedAt ? toDate(parsed.data.issuedAt) : null,
        dueDate: toDate(parsed.data.dueDate),
        paidAt: parsed.data.paidAt ? toDate(parsed.data.paidAt) : null,
        paymentMethodId: toNullableId(parsed.data.paymentMethodId ?? ""),
        notes: parsed.data.notes,
      },
    });
  }

  await recordAuditEvent({
    userId: user.id,
    householdId: household.id,
    requestId,
    action: parsed.data.id ? "recurring_bill_payment.update" : "recurring_bill_payment.create",
    targetType: "recurringBillPayment",
    targetId: parsed.data.id,
  });

  revalidatePath("/gastos-fijos");
  revalidatePath("/");
  redirect(withMessage("/gastos-fijos", parsed.data.id ? "Pago actualizado." : "Pago registrado."));
}

export async function deleteRecurringBillPaymentAction(formData: FormData) {
  const { user, household, requestId } = await requireMutationContext("recurringBillPayment.delete");
  const id = getString(formData, "id");
  await assertOwnedResource("recurringBillPayment", id, household.id);
  await prisma.recurringBillPayment.updateMany({ where: { id, householdId: household.id }, data: { deletedAt: new Date() } });
  await recordAuditEvent({ userId: user.id, householdId: household.id, requestId, action: "recurring_bill_payment.delete", targetType: "recurringBillPayment", targetId: id });
  revalidatePath("/gastos-fijos");
  revalidatePath("/");
  redirect(withMessage("/gastos-fijos", "Pago borrado."));
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
