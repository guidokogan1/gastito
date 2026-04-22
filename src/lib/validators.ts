import { z } from "zod";

const money = z
  .string()
  .trim()
  .regex(/^\d+([.,]\d{1,2})?$/, "Ingresá un monto válido.")
  .transform((value) => value.replace(",", "."))
  .refine((value) => Number(value) > 0, "El monto debe ser mayor a cero.");

const nonNegativeMoney = z
  .string()
  .trim()
  .regex(/^\d+([.,]\d{1,2})?$/, "Ingresá un monto válido.")
  .transform((value) => value.replace(",", "."))
  .refine((value) => Number(value) >= 0, "El monto no puede ser negativo.");

export const authSchema = z.object({
  email: z.string().trim().email("Ingresá un email válido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

export const onboardingSchema = z.object({
  householdName: z.string().trim().min(2, "Poné un nombre para el hogar."),
});

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "El nombre es obligatorio."),
  isActive: z.coerce.boolean().default(true),
});

export const paymentMethodSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "El nombre es obligatorio."),
  isActive: z.coerce.boolean().default(true),
});

export const accountSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "El nombre es obligatorio."),
  type: z.enum(["cash", "bank", "wallet"]),
  isActive: z.coerce.boolean().default(true),
});

export const transactionSchema = z.object({
  id: z.string().optional(),
  date: z.string().min(1, "La fecha es obligatoria."),
  amount: money,
  type: z.enum(["expense", "income"]),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  paymentMethodId: z.string().optional(),
  detail: z.string().trim().optional(),
});

export const debtSchema = z
  .object({
    id: z.string().optional(),
    entityName: z.string().trim().min(2, "El nombre es obligatorio."),
    direction: z.enum(["we_owe", "they_owe_us"]),
    originalAmount: money,
    remainingBalance: nonNegativeMoney,
    notes: z.string().trim().optional(),
    isActive: z.coerce.boolean().default(true),
  })
  .refine((data) => Number(data.remainingBalance) <= Number(data.originalAmount), {
    message: "El saldo restante no puede superar al monto original.",
    path: ["remainingBalance"],
  });

export const recurringBillSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "El nombre es obligatorio."),
  amount: money,
  dueDay: z.coerce.number().int().min(1).max(31),
  notes: z.string().trim().optional(),
  paymentMethodId: z.string().optional(),
  isActive: z.coerce.boolean().default(true),
});
