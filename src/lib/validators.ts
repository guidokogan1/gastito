import { z } from "zod";

export const authSchema = z.object({
  email: z.string().trim().email("Ingresá un email válido."),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres."),
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
  type: z.string().trim().min(2, "Elegí un tipo."),
  isActive: z.coerce.boolean().default(true),
});

export const transactionSchema = z.object({
  id: z.string().optional(),
  date: z.string().min(1, "La fecha es obligatoria."),
  amount: z.coerce.number().positive("El monto debe ser mayor a cero."),
  type: z.enum(["expense", "income"]),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  paymentMethodId: z.string().optional(),
  detail: z.string().trim().optional(),
});

export const debtSchema = z.object({
  id: z.string().optional(),
  entityName: z.string().trim().min(2, "El nombre es obligatorio."),
  direction: z.enum(["we_owe", "they_owe_us"]),
  originalAmount: z.coerce.number().positive("El monto original debe ser mayor a cero."),
  remainingBalance: z.coerce.number().nonnegative("El saldo restante no puede ser negativo."),
  notes: z.string().trim().optional(),
  isActive: z.coerce.boolean().default(true),
});

export const recurringBillSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "El nombre es obligatorio."),
  amount: z.coerce.number().positive("El monto debe ser mayor a cero."),
  dueDay: z.coerce.number().int().min(1).max(31),
  notes: z.string().trim().optional(),
  paymentMethodId: z.string().optional(),
  isActive: z.coerce.boolean().default(true),
});
