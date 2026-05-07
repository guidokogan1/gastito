import type { AccountType, CategoryKind, PaymentMethodType } from "@prisma/client";

export const DEFAULT_CATEGORIES = [
  { name: "Supermercado", icon: "cart", color: "#FBEFE7", budget: "0", sortOrder: 10, kind: "expense" },
  { name: "Comida", icon: "fork", color: "#FBE6E1", budget: "0", sortOrder: 20, kind: "expense" },
  { name: "Transporte", icon: "arrowURD", color: "#E8EEF8", budget: "0", sortOrder: 30, kind: "expense" },
  { name: "Hogar", icon: "home2", color: "#E4EFE9", budget: "0", sortOrder: 40, kind: "expense" },
  { name: "Salud", icon: "heart", color: "#EDEAF7", budget: "0", sortOrder: 50, kind: "expense" },
  { name: "Servicios", icon: "wifi", color: "#FAEDD3", budget: "0", sortOrder: 60, kind: "expense" },
  { name: "Educacion", icon: "cap", color: "#E1ECFB", budget: "0", sortOrder: 70, kind: "expense" },
  { name: "Mascotas", icon: "paw", color: "#F6EAF8", budget: "0", sortOrder: 80, kind: "expense" },
  { name: "Impuestos", icon: "receipt", color: "#F1F1F3", budget: "0", sortOrder: 90, kind: "expense" },
  { name: "Ocio", icon: "gamepad", color: "#F4EFE5", budget: "0", sortOrder: 100, kind: "expense" },
  { name: "Regalos", icon: "gift", color: "#FCEEF4", budget: "0", sortOrder: 110, kind: "expense" },
  { name: "Otros", icon: "more", color: "#F7F7F8", budget: "0", sortOrder: 120, kind: "expense" },
] satisfies Array<{
  name: string;
  icon: string;
  color: string;
  budget: string;
  sortOrder: number;
  kind: CategoryKind;
}>;

export const DEFAULT_INCOME_CATEGORIES = [
  { name: "Sueldo", icon: "arrowDown", color: "#E4EFE9", budget: "0", sortOrder: 10, kind: "income" },
  { name: "Devolución", icon: "repeat", color: "#E1ECFB", budget: "0", sortOrder: 20, kind: "income" },
  { name: "Descuento", icon: "tag", color: "#FAEDD3", budget: "0", sortOrder: 30, kind: "income" },
] satisfies Array<{
  name: string;
  icon: string;
  color: string;
  budget: string;
  sortOrder: number;
  kind: CategoryKind;
}>;

export const DEFAULT_PAYMENT_METHODS = [
  { name: "Efectivo", type: "cash" },
  { name: "Débito", type: "debit" },
  { name: "Crédito", type: "credit" },
  { name: "Transferencia", type: "transfer" },
  { name: "Mercado Pago", type: "wallet" },
] satisfies Array<{ name: string; type: PaymentMethodType }>;

export const DEFAULT_BANKS = [
  { name: "Banco principal", color: "#0E3B2E" },
  { name: "Mercado Pago", color: "#0A6EE0" },
];

export const DEFAULT_ACCOUNTS = [
  { name: "Efectivo", type: "cash" },
  { name: "Banco principal", type: "bank" },
  { name: "Billetera virtual", type: "wallet" },
] satisfies Array<{ name: string; type: AccountType }>;
