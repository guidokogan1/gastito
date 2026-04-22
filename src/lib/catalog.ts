export const DEFAULT_CATEGORIES = [
  "Supermercado",
  "Comida",
  "Transporte",
  "Hogar",
  "Salud",
  "Servicios",
  "Educacion",
  "Mascotas",
  "Impuestos",
  "Ocio",
  "Regalos",
  "Otros",
];

export const DEFAULT_PAYMENT_METHODS = [
  "Efectivo",
  "Debito",
  "Credito",
  "Transferencia",
  "Mercado Pago",
];

export const DEFAULT_ACCOUNTS = [
  { name: "Efectivo", type: "cash" },
  { name: "Banco principal", type: "bank" },
  { name: "Billetera virtual", type: "wallet" },
] satisfies Array<{ name: string; type: AccountType }>;
import type { AccountType } from "@prisma/client";
