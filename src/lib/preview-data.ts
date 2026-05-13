import "server-only";

import type { PreviewPreset } from "@/lib/preview-mode";

type TransactionType = "expense" | "income";
type DebtDirection = "we_owe" | "they_owe_us";

type PreviewCategory = {
  id: string;
  name: string;
  kind: TransactionType;
};

type PreviewMethod = {
  id: string;
  name: string;
};

type PreviewAccount = {
  id: string;
  name: string;
};

type PreviewBank = {
  id: string;
  name: string;
};

type PreviewTransaction = {
  id: string;
  date: Date;
  amount: number;
  type: TransactionType;
  detail: string | null;
  accountId: string | null;
  categoryId: string | null;
  paymentMethodId: string | null;
};

type PreviewBillPayment = {
  id: string;
  amount: number;
  issuedAt: Date | null;
  dueDate: Date;
  paidAt: Date | null;
  notes: string | null;
  paymentMethodId: string | null;
  transactionId: string | null;
};

type PreviewBill = {
  id: string;
  name: string;
  icon: string;
  amount: number;
  dueDay: number;
  notes: string | null;
  paymentMethodId: string | null;
  defaultCategoryId: string | null;
  payments: PreviewBillPayment[];
};

type PreviewDebtPayment = {
  id: string;
  date: Date;
  amount: number;
  notes: string | null;
  transactionId: string | null;
};

type PreviewDebt = {
  id: string;
  entityName: string;
  direction: DebtDirection;
  originalAmount: number;
  remainingBalance: number;
  notes: string | null;
  createdAt: Date;
  payments: PreviewDebtPayment[];
};

export type PreviewDataset = {
  memberCount: number;
  categories: PreviewCategory[];
  methods: PreviewMethod[];
  accounts: PreviewAccount[];
  banks: PreviewBank[];
  transactions: PreviewTransaction[];
  bills: PreviewBill[];
  debts: PreviewDebt[];
};

function currentMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function monthOffset(offset: number) {
  const start = currentMonthStart();
  return new Date(start.getFullYear(), start.getMonth() + offset, 1);
}

function atDay(offset: number, day: number, hour = 12) {
  const date = monthOffset(offset);
  return new Date(date.getFullYear(), date.getMonth(), day, hour, 0, 0, 0);
}

function keyForMonth(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function currentPreviewMonthKey() {
  return keyForMonth(currentMonthStart());
}

const categories: PreviewCategory[] = [
  { id: "cat-food", name: "Comida", kind: "expense" },
  { id: "cat-home", name: "Hogar", kind: "expense" },
  { id: "cat-auto", name: "Auto", kind: "expense" },
  { id: "cat-pets", name: "Mascotas", kind: "expense" },
  { id: "cat-fun", name: "Ocio", kind: "expense" },
  { id: "cat-health", name: "Salud", kind: "expense" },
  { id: "cat-edu", name: "Educación", kind: "expense" },
  { id: "cat-tax", name: "Impuestos", kind: "expense" },
  { id: "cat-work", name: "Trabajo", kind: "expense" },
  { id: "cat-service", name: "Servicios", kind: "expense" },
  { id: "cat-gift", name: "Regalos", kind: "expense" },
  { id: "cat-other", name: "Otros", kind: "expense" },
  { id: "cat-salary", name: "Sueldo", kind: "income" },
  { id: "cat-refund", name: "Devolución", kind: "income" },
  { id: "cat-transfer", name: "Transferencia", kind: "income" },
];

const methods: PreviewMethod[] = [
  { id: "method-credit-visa", name: "Crédito Visa" },
  { id: "method-debit-bank", name: "Débito Banco" },
  { id: "method-transfer", name: "Transferencia" },
  { id: "method-cash", name: "Efectivo" },
  { id: "method-auto-debit", name: "Débito automático" },
  { id: "method-mp", name: "Mercado Pago" },
];

const accounts: PreviewAccount[] = [
  { id: "account-main", name: "Cuenta principal" },
  { id: "account-wallet", name: "Billetera" },
  { id: "account-savings", name: "Ahorros" },
  { id: "account-cash", name: "Efectivo" },
];

const banks: PreviewBank[] = [
  { id: "bank-galicia", name: "Galicia" },
  { id: "bank-santander", name: "Santander" },
  { id: "bank-mp", name: "Mercado Pago" },
  { id: "bank-cash", name: "Caja chica" },
];

function baseTransactionsFull(): PreviewTransaction[] {
  return [
    { id: "tx-may-01-expensas", date: atDay(0, 1, 10), amount: 92000, type: "expense", detail: "Expensas mayo", accountId: "account-main", categoryId: "cat-home", paymentMethodId: "method-transfer" },
    { id: "tx-may-02-renta", date: atDay(0, 2, 9), amount: 85000, type: "income", detail: "Transferencia cuarto", accountId: "account-main", categoryId: "cat-transfer", paymentMethodId: "method-transfer" },
    { id: "tx-may-03-coto", date: atDay(0, 3, 13), amount: 68400, type: "expense", detail: "Coto — compra semanal", accountId: "account-main", categoryId: "cat-food", paymentMethodId: "method-credit-visa" },
    { id: "tx-may-04-vet", date: atDay(0, 4, 11), amount: 18200, type: "expense", detail: "Veterinaria Mora", accountId: "account-main", categoryId: "cat-pets", paymentMethodId: "method-mp" },
    { id: "tx-may-05-spotify", date: atDay(0, 5, 9), amount: 3990, type: "expense", detail: "Spotify Familiar", accountId: "account-main", categoryId: "cat-fun", paymentMethodId: "method-credit-visa" },
    { id: "tx-may-05-lucia", date: atDay(0, 5, 18), amount: 35000, type: "income", detail: "Cobro Lucía", accountId: "account-main", categoryId: "cat-transfer", paymentMethodId: "method-transfer" },
    { id: "tx-may-06-edenor", date: atDay(0, 6, 8), amount: 34000, type: "expense", detail: "Edenor", accountId: "account-main", categoryId: "cat-home", paymentMethodId: "method-auto-debit" },
    { id: "tx-may-07-nafta", date: atDay(0, 7, 17), amount: 22500, type: "expense", detail: "Nafta YPF", accountId: "account-main", categoryId: "cat-auto", paymentMethodId: "method-debit-bank" },
    { id: "tx-may-08-salary", date: atDay(0, 8, 9), amount: 540000, type: "income", detail: "Sueldo Mariana", accountId: "account-main", categoryId: "cat-salary", paymentMethodId: "method-transfer" },
    { id: "tx-may-08-farmacia", date: atDay(0, 8, 20), amount: 12800, type: "expense", detail: "Farmacity", accountId: "account-main", categoryId: "cat-health", paymentMethodId: "method-mp" },
    { id: "tx-may-09-juan", date: atDay(0, 9, 12), amount: 40000, type: "expense", detail: "Pago deuda Juan", accountId: "account-main", categoryId: "cat-other", paymentMethodId: "method-transfer" },
    { id: "tx-may-10-colegio", date: atDay(0, 10, 10), amount: 78000, type: "expense", detail: "Colegio Tomi", accountId: "account-main", categoryId: "cat-edu", paymentMethodId: "method-transfer" },
    { id: "tx-may-11-cafe", date: atDay(0, 11, 19), amount: 8900, type: "expense", detail: "Café + almacén", accountId: "account-wallet", categoryId: "cat-food", paymentMethodId: "method-cash" },
    { id: "tx-may-12-freelance", date: atDay(0, 12, 15), amount: 165000, type: "income", detail: "Freelance diseño", accountId: "account-savings", categoryId: "cat-work", paymentMethodId: "method-transfer" },
    { id: "tx-may-12-mascotas", date: atDay(0, 12, 19), amount: 14600, type: "expense", detail: "Balanceado Mora", accountId: "account-main", categoryId: "cat-pets", paymentMethodId: "method-debit-bank" },
    { id: "tx-may-13-reintegro", date: atDay(0, 13, 10), amount: 12800, type: "income", detail: "Reintegro obra social", accountId: "account-main", categoryId: "cat-refund", paymentMethodId: "method-transfer" },
    { id: "tx-may-13-super", date: atDay(0, 13, 14), amount: 24600, type: "expense", detail: "Super chino", accountId: "account-wallet", categoryId: "cat-food", paymentMethodId: "method-mp" },
    { id: "tx-may-13-salida", date: atDay(0, 13, 22), amount: 15400, type: "expense", detail: "Cena viernes", accountId: "account-main", categoryId: "cat-fun", paymentMethodId: "method-credit-visa" },

    { id: "tx-apr-01-expensas", date: atDay(-1, 1, 10), amount: 88000, type: "expense", detail: "Expensas abril", accountId: "account-main", categoryId: "cat-home", paymentMethodId: "method-transfer" },
    { id: "tx-apr-05-spotify", date: atDay(-1, 5, 9), amount: 3990, type: "expense", detail: "Spotify Familiar", accountId: "account-main", categoryId: "cat-fun", paymentMethodId: "method-credit-visa" },
    { id: "tx-apr-06-personal", date: atDay(-1, 6, 9), amount: 18600, type: "expense", detail: "Personal", accountId: "account-main", categoryId: "cat-service", paymentMethodId: "method-auto-debit" },
    { id: "tx-apr-06-edenor", date: atDay(-1, 6, 11), amount: 29800, type: "expense", detail: "Edenor", accountId: "account-main", categoryId: "cat-home", paymentMethodId: "method-auto-debit" },
    { id: "tx-apr-08-salary", date: atDay(-1, 8, 9), amount: 530000, type: "income", detail: "Sueldo Mariana", accountId: "account-main", categoryId: "cat-salary", paymentMethodId: "method-transfer" },
    { id: "tx-apr-10-internet", date: atDay(-1, 10, 10), amount: 29700, type: "expense", detail: "Internet Fibertel", accountId: "account-main", categoryId: "cat-service", paymentMethodId: "method-auto-debit" },
    { id: "tx-apr-14-personal-familia", date: atDay(-1, 14, 18), amount: 9600, type: "expense", detail: "Regalo sobrino", accountId: "account-main", categoryId: "cat-gift", paymentMethodId: "method-credit-visa" },
    { id: "tx-apr-18-swiss", date: atDay(-1, 18, 12), amount: 138000, type: "expense", detail: "Prepaga Swiss", accountId: "account-main", categoryId: "cat-health", paymentMethodId: "method-transfer" },
    { id: "tx-apr-20-coto", date: atDay(-1, 20, 13), amount: 75400, type: "expense", detail: "Coto — compra quincenal", accountId: "account-main", categoryId: "cat-food", paymentMethodId: "method-credit-visa" },
    { id: "tx-apr-22-metrogas", date: atDay(-1, 22, 12), amount: 22100, type: "expense", detail: "Metrogas", accountId: "account-main", categoryId: "cat-home", paymentMethodId: "method-auto-debit" },
    { id: "tx-apr-25-juan", date: atDay(-1, 25, 16), amount: 35000, type: "expense", detail: "Pago deuda Juan", accountId: "account-main", categoryId: "cat-other", paymentMethodId: "method-transfer" },
    { id: "tx-apr-25-freelance", date: atDay(-1, 25, 18), amount: 140000, type: "income", detail: "Freelance branding", accountId: "account-savings", categoryId: "cat-work", paymentMethodId: "method-transfer" },
    { id: "tx-apr-30-mama", date: atDay(-1, 30, 14), amount: 30000, type: "income", detail: "Cobro Mamá", accountId: "account-main", categoryId: "cat-transfer", paymentMethodId: "method-transfer" },

    { id: "tx-mar-01-expensas", date: atDay(-2, 1, 10), amount: 84500, type: "expense", detail: "Expensas marzo", accountId: "account-main", categoryId: "cat-home", paymentMethodId: "method-transfer" },
    { id: "tx-mar-05-spotify", date: atDay(-2, 5, 9), amount: 3990, type: "expense", detail: "Spotify Familiar", accountId: "account-main", categoryId: "cat-fun", paymentMethodId: "method-credit-visa" },
    { id: "tx-mar-06-edenor", date: atDay(-2, 6, 11), amount: 27400, type: "expense", detail: "Edenor", accountId: "account-main", categoryId: "cat-home", paymentMethodId: "method-auto-debit" },
    { id: "tx-mar-08-salary", date: atDay(-2, 8, 9), amount: 520000, type: "income", detail: "Sueldo Mariana", accountId: "account-main", categoryId: "cat-salary", paymentMethodId: "method-transfer" },
    { id: "tx-mar-10-internet", date: atDay(-2, 10, 10), amount: 28900, type: "expense", detail: "Internet Fibertel", accountId: "account-main", categoryId: "cat-service", paymentMethodId: "method-auto-debit" },
    { id: "tx-mar-14-personal", date: atDay(-2, 14, 12), amount: 17900, type: "expense", detail: "Personal", accountId: "account-main", categoryId: "cat-service", paymentMethodId: "method-auto-debit" },
    { id: "tx-mar-17-metrogas", date: atDay(-2, 17, 12), amount: 19800, type: "expense", detail: "Metrogas", accountId: "account-main", categoryId: "cat-home", paymentMethodId: "method-auto-debit" },
    { id: "tx-mar-20-swiss", date: atDay(-2, 20, 12), amount: 135000, type: "expense", detail: "Prepaga Swiss", accountId: "account-main", categoryId: "cat-health", paymentMethodId: "method-transfer" },
    { id: "tx-mar-21-super", date: atDay(-2, 21, 13), amount: 63200, type: "expense", detail: "Compra mensual", accountId: "account-main", categoryId: "cat-food", paymentMethodId: "method-credit-visa" },
    { id: "tx-mar-25-lucia", date: atDay(-2, 25, 15), amount: 25000, type: "income", detail: "Cobro Lucía", accountId: "account-main", categoryId: "cat-transfer", paymentMethodId: "method-transfer" },
    { id: "tx-mar-28-juan", date: atDay(-2, 28, 16), amount: 20000, type: "expense", detail: "Pago deuda Juan", accountId: "account-main", categoryId: "cat-other", paymentMethodId: "method-transfer" },

    { id: "tx-feb-01-expensas", date: atDay(-3, 1, 10), amount: 81200, type: "expense", detail: "Expensas febrero", accountId: "account-main", categoryId: "cat-home", paymentMethodId: "method-transfer" },
    { id: "tx-feb-05-spotify", date: atDay(-3, 5, 9), amount: 3690, type: "expense", detail: "Spotify Familiar", accountId: "account-main", categoryId: "cat-fun", paymentMethodId: "method-credit-visa" },
    { id: "tx-feb-07-edenor", date: atDay(-3, 7, 11), amount: 25100, type: "expense", detail: "Edenor", accountId: "account-main", categoryId: "cat-home", paymentMethodId: "method-auto-debit" },
    { id: "tx-feb-08-salary", date: atDay(-3, 8, 9), amount: 510000, type: "income", detail: "Sueldo Mariana", accountId: "account-main", categoryId: "cat-salary", paymentMethodId: "method-transfer" },
    { id: "tx-feb-10-internet", date: atDay(-3, 10, 10), amount: 27400, type: "expense", detail: "Internet Fibertel", accountId: "account-main", categoryId: "cat-service", paymentMethodId: "method-auto-debit" },
    { id: "tx-feb-14-personal", date: atDay(-3, 14, 12), amount: 16800, type: "expense", detail: "Personal", accountId: "account-main", categoryId: "cat-service", paymentMethodId: "method-auto-debit" },
    { id: "tx-feb-17-metrogas", date: atDay(-3, 17, 12), amount: 18400, type: "expense", detail: "Metrogas", accountId: "account-main", categoryId: "cat-home", paymentMethodId: "method-auto-debit" },
    { id: "tx-feb-19-swiss", date: atDay(-3, 19, 12), amount: 129000, type: "expense", detail: "Prepaga Swiss", accountId: "account-main", categoryId: "cat-health", paymentMethodId: "method-transfer" },
    { id: "tx-feb-21-super", date: atDay(-3, 21, 13), amount: 59800, type: "expense", detail: "Compra mensual", accountId: "account-main", categoryId: "cat-food", paymentMethodId: "method-credit-visa" },
    { id: "tx-feb-26-mama", date: atDay(-3, 26, 14), amount: 30000, type: "income", detail: "Cobro Mamá", accountId: "account-main", categoryId: "cat-transfer", paymentMethodId: "method-transfer" },

    { id: "tx-jan-02-expensas", date: atDay(-4, 2, 10), amount: 78400, type: "expense", detail: "Expensas enero", accountId: "account-main", categoryId: "cat-home", paymentMethodId: "method-transfer" },
    { id: "tx-jan-05-spotify", date: atDay(-4, 5, 9), amount: 3490, type: "expense", detail: "Spotify Familiar", accountId: "account-main", categoryId: "cat-fun", paymentMethodId: "method-credit-visa" },
    { id: "tx-jan-06-edenor", date: atDay(-4, 6, 11), amount: 22800, type: "expense", detail: "Edenor", accountId: "account-main", categoryId: "cat-home", paymentMethodId: "method-auto-debit" },
    { id: "tx-jan-08-salary", date: atDay(-4, 8, 9), amount: 505000, type: "income", detail: "Sueldo Mariana", accountId: "account-main", categoryId: "cat-salary", paymentMethodId: "method-transfer" },
    { id: "tx-jan-10-internet", date: atDay(-4, 10, 10), amount: 26100, type: "expense", detail: "Internet Fibertel", accountId: "account-main", categoryId: "cat-service", paymentMethodId: "method-auto-debit" },
    { id: "tx-jan-14-personal", date: atDay(-4, 14, 12), amount: 15400, type: "expense", detail: "Personal", accountId: "account-main", categoryId: "cat-service", paymentMethodId: "method-auto-debit" },
    { id: "tx-jan-17-metrogas", date: atDay(-4, 17, 12), amount: 16200, type: "expense", detail: "Metrogas", accountId: "account-main", categoryId: "cat-home", paymentMethodId: "method-auto-debit" },
    { id: "tx-jan-20-swiss", date: atDay(-4, 20, 12), amount: 122000, type: "expense", detail: "Prepaga Swiss", accountId: "account-main", categoryId: "cat-health", paymentMethodId: "method-transfer" },
    { id: "tx-jan-21-super", date: atDay(-4, 21, 13), amount: 55200, type: "expense", detail: "Compra mensual", accountId: "account-main", categoryId: "cat-food", paymentMethodId: "method-credit-visa" },
    { id: "tx-jan-27-lucia", date: atDay(-4, 27, 14), amount: 30000, type: "income", detail: "Cobro Lucía", accountId: "account-main", categoryId: "cat-transfer", paymentMethodId: "method-transfer" },

    { id: "tx-dec-02-expensas", date: atDay(-5, 2, 10), amount: 74800, type: "expense", detail: "Expensas diciembre", accountId: "account-main", categoryId: "cat-home", paymentMethodId: "method-transfer" },
    { id: "tx-dec-05-spotify", date: atDay(-5, 5, 9), amount: 3490, type: "expense", detail: "Spotify Familiar", accountId: "account-main", categoryId: "cat-fun", paymentMethodId: "method-credit-visa" },
    { id: "tx-dec-07-edenor", date: atDay(-5, 7, 11), amount: 21400, type: "expense", detail: "Edenor", accountId: "account-main", categoryId: "cat-home", paymentMethodId: "method-auto-debit" },
    { id: "tx-dec-08-salary", date: atDay(-5, 8, 9), amount: 500000, type: "income", detail: "Sueldo Mariana", accountId: "account-main", categoryId: "cat-salary", paymentMethodId: "method-transfer" },
    { id: "tx-dec-10-internet", date: atDay(-5, 10, 10), amount: 24800, type: "expense", detail: "Internet Fibertel", accountId: "account-main", categoryId: "cat-service", paymentMethodId: "method-auto-debit" },
    { id: "tx-dec-14-personal", date: atDay(-5, 14, 12), amount: 14200, type: "expense", detail: "Personal", accountId: "account-main", categoryId: "cat-service", paymentMethodId: "method-auto-debit" },
    { id: "tx-dec-17-metrogas", date: atDay(-5, 17, 12), amount: 15800, type: "expense", detail: "Metrogas", accountId: "account-main", categoryId: "cat-home", paymentMethodId: "method-auto-debit" },
    { id: "tx-dec-18-swiss", date: atDay(-5, 18, 12), amount: 118000, type: "expense", detail: "Prepaga Swiss", accountId: "account-main", categoryId: "cat-health", paymentMethodId: "method-transfer" },
    { id: "tx-dec-21-aguinaldo", date: atDay(-5, 21, 10), amount: 310000, type: "income", detail: "Aguinaldo", accountId: "account-savings", categoryId: "cat-salary", paymentMethodId: "method-transfer" },
    { id: "tx-dec-21-mama", date: atDay(-5, 21, 15), amount: 30000, type: "income", detail: "Cobro Mamá", accountId: "account-main", categoryId: "cat-transfer", paymentMethodId: "method-transfer" },
    { id: "tx-dec-22-super", date: atDay(-5, 22, 13), amount: 61200, type: "expense", detail: "Compra fiestas", accountId: "account-main", categoryId: "cat-food", paymentMethodId: "method-credit-visa" },

    { id: "tx-nov-05-spotify", date: atDay(-6, 5, 9), amount: 3290, type: "expense", detail: "Spotify Familiar", accountId: "account-main", categoryId: "cat-fun", paymentMethodId: "method-credit-visa" },
    { id: "tx-nov-08-salary", date: atDay(-6, 8, 9), amount: 490000, type: "income", detail: "Sueldo Mariana", accountId: "account-main", categoryId: "cat-salary", paymentMethodId: "method-transfer" },
    { id: "tx-nov-10-internet", date: atDay(-6, 10, 10), amount: 23200, type: "expense", detail: "Internet Fibertel", accountId: "account-main", categoryId: "cat-service", paymentMethodId: "method-auto-debit" },
    { id: "tx-nov-14-personal", date: atDay(-6, 14, 12), amount: 13800, type: "expense", detail: "Personal", accountId: "account-main", categoryId: "cat-service", paymentMethodId: "method-auto-debit" },
    { id: "tx-nov-16-super", date: atDay(-6, 16, 13), amount: 54400, type: "expense", detail: "Compra mensual", accountId: "account-main", categoryId: "cat-food", paymentMethodId: "method-credit-visa" },
    { id: "tx-nov-22-freelance", date: atDay(-6, 22, 17), amount: 110000, type: "income", detail: "Freelance UX", accountId: "account-savings", categoryId: "cat-work", paymentMethodId: "method-transfer" },
  ];
}

function baseBillsFull(): PreviewBill[] {
  return [
    {
      id: "bill-internet",
      name: "Internet Fibertel",
      icon: "wifi",
      amount: 30000,
      dueDay: 10,
      notes: "Cliente 1234 · Plan 500MB",
      paymentMethodId: "method-auto-debit",
      defaultCategoryId: "cat-service",
      payments: [
        { id: "billp-internet-may", amount: 30000, issuedAt: atDay(0, 5), dueDate: atDay(0, 10), paidAt: null, notes: "Todavía no debitó", paymentMethodId: "method-auto-debit", transactionId: null },
        { id: "billp-internet-apr", amount: 29700, issuedAt: atDay(-1, 4), dueDate: atDay(-1, 10), paidAt: atDay(-1, 10), notes: null, paymentMethodId: "method-auto-debit", transactionId: "tx-apr-10-internet" },
        { id: "billp-internet-mar", amount: 28900, issuedAt: atDay(-2, 4), dueDate: atDay(-2, 10), paidAt: atDay(-2, 10), notes: null, paymentMethodId: "method-auto-debit", transactionId: "tx-mar-10-internet" },
        { id: "billp-internet-feb", amount: 27400, issuedAt: atDay(-3, 4), dueDate: atDay(-3, 10), paidAt: atDay(-3, 10), notes: null, paymentMethodId: "method-auto-debit", transactionId: "tx-feb-10-internet" },
        { id: "billp-internet-jan", amount: 26100, issuedAt: atDay(-4, 4), dueDate: atDay(-4, 10), paidAt: atDay(-4, 10), notes: null, paymentMethodId: "method-auto-debit", transactionId: "tx-jan-10-internet" },
        { id: "billp-internet-dec", amount: 24800, issuedAt: atDay(-5, 4), dueDate: atDay(-5, 10), paidAt: atDay(-5, 10), notes: null, paymentMethodId: "method-auto-debit", transactionId: "tx-dec-10-internet" },
      ],
    },
    {
      id: "bill-swiss",
      name: "Prepaga Swiss",
      icon: "file",
      amount: 142000,
      dueDay: 21,
      notes: "Plan familiar",
      paymentMethodId: "method-transfer",
      defaultCategoryId: "cat-health",
      payments: [
        { id: "billp-swiss-may", amount: 142000, issuedAt: atDay(0, 7), dueDate: atDay(0, 21), paidAt: null, notes: "Factura mayo", paymentMethodId: "method-transfer", transactionId: null },
        { id: "billp-swiss-apr", amount: 138000, issuedAt: atDay(-1, 8), dueDate: atDay(-1, 20), paidAt: atDay(-1, 18), notes: null, paymentMethodId: "method-transfer", transactionId: "tx-apr-18-swiss" },
        { id: "billp-swiss-mar", amount: 135000, issuedAt: atDay(-2, 7), dueDate: atDay(-2, 20), paidAt: atDay(-2, 20), notes: null, paymentMethodId: "method-transfer", transactionId: "tx-mar-20-swiss" },
        { id: "billp-swiss-feb", amount: 129000, issuedAt: atDay(-3, 7), dueDate: atDay(-3, 19), paidAt: atDay(-3, 19), notes: null, paymentMethodId: "method-transfer", transactionId: "tx-feb-19-swiss" },
        { id: "billp-swiss-jan", amount: 122000, issuedAt: atDay(-4, 7), dueDate: atDay(-4, 20), paidAt: atDay(-4, 20), notes: null, paymentMethodId: "method-transfer", transactionId: "tx-jan-20-swiss" },
        { id: "billp-swiss-dec", amount: 118000, issuedAt: atDay(-5, 7), dueDate: atDay(-5, 18), paidAt: atDay(-5, 18), notes: null, paymentMethodId: "method-transfer", transactionId: "tx-dec-18-swiss" },
      ],
    },
    {
      id: "bill-edenor",
      name: "Edenor",
      icon: "file",
      amount: 34000,
      dueDay: 6,
      notes: "Factura luz",
      paymentMethodId: "method-auto-debit",
      defaultCategoryId: "cat-home",
      payments: [
        { id: "billp-edenor-may", amount: 34000, issuedAt: atDay(0, 1), dueDate: atDay(0, 6), paidAt: atDay(0, 6), notes: null, paymentMethodId: "method-auto-debit", transactionId: "tx-may-06-edenor" },
        { id: "billp-edenor-apr", amount: 29800, issuedAt: atDay(-1, 1), dueDate: atDay(-1, 6), paidAt: atDay(-1, 6), notes: null, paymentMethodId: "method-auto-debit", transactionId: "tx-apr-06-edenor" },
        { id: "billp-edenor-mar", amount: 27400, issuedAt: atDay(-2, 1), dueDate: atDay(-2, 6), paidAt: atDay(-2, 6), notes: null, paymentMethodId: "method-auto-debit", transactionId: "tx-mar-06-edenor" },
        { id: "billp-edenor-feb", amount: 25100, issuedAt: atDay(-3, 1), dueDate: atDay(-3, 7), paidAt: atDay(-3, 7), notes: null, paymentMethodId: "method-auto-debit", transactionId: "tx-feb-07-edenor" },
        { id: "billp-edenor-jan", amount: 22800, issuedAt: atDay(-4, 1), dueDate: atDay(-4, 6), paidAt: atDay(-4, 6), notes: null, paymentMethodId: "method-auto-debit", transactionId: "tx-jan-06-edenor" },
        { id: "billp-edenor-dec", amount: 21400, issuedAt: atDay(-5, 1), dueDate: atDay(-5, 7), paidAt: atDay(-5, 7), notes: null, paymentMethodId: "method-auto-debit", transactionId: "tx-dec-07-edenor" },
      ],
    },
    {
      id: "bill-spotify",
      name: "Spotify Familiar",
      icon: "file",
      amount: 3990,
      dueDay: 6,
      notes: "Suscripción",
      paymentMethodId: "method-credit-visa",
      defaultCategoryId: "cat-fun",
      payments: [
        { id: "billp-spotify-may", amount: 3990, issuedAt: atDay(0, 2), dueDate: atDay(0, 5), paidAt: atDay(0, 5), notes: null, paymentMethodId: "method-credit-visa", transactionId: "tx-may-05-spotify" },
        { id: "billp-spotify-apr", amount: 3990, issuedAt: atDay(-1, 2), dueDate: atDay(-1, 5), paidAt: atDay(-1, 5), notes: null, paymentMethodId: "method-credit-visa", transactionId: "tx-apr-05-spotify" },
        { id: "billp-spotify-mar", amount: 3990, issuedAt: atDay(-2, 2), dueDate: atDay(-2, 5), paidAt: atDay(-2, 5), notes: null, paymentMethodId: "method-credit-visa", transactionId: "tx-mar-05-spotify" },
        { id: "billp-spotify-feb", amount: 3690, issuedAt: atDay(-3, 2), dueDate: atDay(-3, 5), paidAt: atDay(-3, 5), notes: null, paymentMethodId: "method-credit-visa", transactionId: "tx-feb-05-spotify" },
        { id: "billp-spotify-jan", amount: 3490, issuedAt: atDay(-4, 2), dueDate: atDay(-4, 5), paidAt: atDay(-4, 5), notes: null, paymentMethodId: "method-credit-visa", transactionId: "tx-jan-05-spotify" },
        { id: "billp-spotify-dec", amount: 3490, issuedAt: atDay(-5, 2), dueDate: atDay(-5, 5), paidAt: atDay(-5, 5), notes: null, paymentMethodId: "method-credit-visa", transactionId: "tx-dec-05-spotify" },
      ],
    },
    {
      id: "bill-personal",
      name: "Personal",
      icon: "wifi",
      amount: 19200,
      dueDay: 14,
      notes: "Plan familiar 4 lineas",
      paymentMethodId: "method-auto-debit",
      defaultCategoryId: "cat-service",
      payments: [
        { id: "billp-personal-may", amount: 19200, issuedAt: atDay(0, 8), dueDate: atDay(0, 14), paidAt: null, notes: "Todavía sin débito", paymentMethodId: "method-auto-debit", transactionId: null },
        { id: "billp-personal-apr", amount: 18600, issuedAt: atDay(-1, 8), dueDate: atDay(-1, 14), paidAt: atDay(-1, 14), notes: null, paymentMethodId: "method-auto-debit", transactionId: "tx-apr-06-personal" },
        { id: "billp-personal-mar", amount: 17900, issuedAt: atDay(-2, 8), dueDate: atDay(-2, 14), paidAt: atDay(-2, 14), notes: null, paymentMethodId: "method-auto-debit", transactionId: "tx-mar-14-personal" },
        { id: "billp-personal-feb", amount: 16800, issuedAt: atDay(-3, 8), dueDate: atDay(-3, 14), paidAt: atDay(-3, 14), notes: null, paymentMethodId: "method-auto-debit", transactionId: "tx-feb-14-personal" },
        { id: "billp-personal-jan", amount: 15400, issuedAt: atDay(-4, 8), dueDate: atDay(-4, 14), paidAt: atDay(-4, 14), notes: null, paymentMethodId: "method-auto-debit", transactionId: "tx-jan-14-personal" },
        { id: "billp-personal-dec", amount: 14200, issuedAt: atDay(-5, 8), dueDate: atDay(-5, 14), paidAt: atDay(-5, 14), notes: null, paymentMethodId: "method-auto-debit", transactionId: "tx-dec-14-personal" },
      ],
    },
    {
      id: "bill-metrogas",
      name: "Metrogas",
      icon: "file",
      amount: 24600,
      dueDay: 17,
      notes: "Gas de red",
      paymentMethodId: "method-auto-debit",
      defaultCategoryId: "cat-home",
      payments: [
        { id: "billp-metrogas-may", amount: 24600, issuedAt: atDay(0, 10), dueDate: atDay(0, 17), paidAt: null, notes: null, paymentMethodId: "method-auto-debit", transactionId: null },
        { id: "billp-metrogas-apr", amount: 22100, issuedAt: atDay(-1, 10), dueDate: atDay(-1, 22), paidAt: atDay(-1, 22), notes: null, paymentMethodId: "method-auto-debit", transactionId: "tx-apr-22-metrogas" },
        { id: "billp-metrogas-mar", amount: 19800, issuedAt: atDay(-2, 10), dueDate: atDay(-2, 17), paidAt: atDay(-2, 17), notes: null, paymentMethodId: "method-auto-debit", transactionId: "tx-mar-17-metrogas" },
        { id: "billp-metrogas-feb", amount: 18400, issuedAt: atDay(-3, 10), dueDate: atDay(-3, 17), paidAt: atDay(-3, 17), notes: null, paymentMethodId: "method-auto-debit", transactionId: "tx-feb-17-metrogas" },
        { id: "billp-metrogas-jan", amount: 16200, issuedAt: atDay(-4, 10), dueDate: atDay(-4, 17), paidAt: atDay(-4, 17), notes: null, paymentMethodId: "method-auto-debit", transactionId: "tx-jan-17-metrogas" },
        { id: "billp-metrogas-dec", amount: 15800, issuedAt: atDay(-5, 10), dueDate: atDay(-5, 17), paidAt: atDay(-5, 17), notes: null, paymentMethodId: "method-auto-debit", transactionId: "tx-dec-17-metrogas" },
      ],
    },
    {
      id: "bill-expensas",
      name: "Expensas",
      icon: "file",
      amount: 92000,
      dueDay: 1,
      notes: "Consorcio edificio",
      paymentMethodId: "method-transfer",
      defaultCategoryId: "cat-home",
      payments: [
        { id: "billp-expensas-may", amount: 92000, issuedAt: atDay(0, 1), dueDate: atDay(0, 1), paidAt: atDay(0, 1), notes: null, paymentMethodId: "method-transfer", transactionId: "tx-may-01-expensas" },
        { id: "billp-expensas-apr", amount: 88000, issuedAt: atDay(-1, 1), dueDate: atDay(-1, 1), paidAt: atDay(-1, 1), notes: null, paymentMethodId: "method-transfer", transactionId: "tx-apr-01-expensas" },
        { id: "billp-expensas-mar", amount: 84500, issuedAt: atDay(-2, 1), dueDate: atDay(-2, 1), paidAt: atDay(-2, 1), notes: null, paymentMethodId: "method-transfer", transactionId: "tx-mar-01-expensas" },
        { id: "billp-expensas-feb", amount: 81200, issuedAt: atDay(-3, 1), dueDate: atDay(-3, 1), paidAt: atDay(-3, 1), notes: null, paymentMethodId: "method-transfer", transactionId: "tx-feb-01-expensas" },
        { id: "billp-expensas-jan", amount: 78400, issuedAt: atDay(-4, 2), dueDate: atDay(-4, 2), paidAt: atDay(-4, 2), notes: null, paymentMethodId: "method-transfer", transactionId: "tx-jan-02-expensas" },
        { id: "billp-expensas-dec", amount: 74800, issuedAt: atDay(-5, 2), dueDate: atDay(-5, 2), paidAt: atDay(-5, 2), notes: null, paymentMethodId: "method-transfer", transactionId: "tx-dec-02-expensas" },
      ],
    },
  ];
}

function baseDebtsFull(): PreviewDebt[] {
  return [
    {
      id: "debt-juan",
      entityName: "Juan",
      direction: "we_owe",
      originalAmount: 120000,
      remainingBalance: 25000,
      notes: "Préstamo para arreglo del auto",
      createdAt: atDay(-2, 27),
      payments: [
        { id: "debtp-juan-1", date: atDay(-2, 28), amount: 20000, notes: "Primer pago", transactionId: "tx-mar-28-juan" },
        { id: "debtp-juan-2", date: atDay(-1, 25), amount: 35000, notes: "Segundo pago", transactionId: "tx-apr-25-juan" },
        { id: "debtp-juan-3", date: atDay(0, 9), amount: 40000, notes: "Tercer pago", transactionId: "tx-may-09-juan" },
      ],
    },
    {
      id: "debt-lucia",
      entityName: "Lucía",
      direction: "they_owe_us",
      originalAmount: 150000,
      remainingBalance: 60000,
      notes: "Compra compartida + vacaciones",
      createdAt: atDay(-4, 15),
      payments: [
        { id: "debtp-lucia-1", date: atDay(-4, 27), amount: 30000, notes: "Primer reintegro", transactionId: "tx-jan-27-lucia" },
        { id: "debtp-lucia-2", date: atDay(-2, 25), amount: 25000, notes: "Segundo reintegro", transactionId: "tx-mar-25-lucia" },
        { id: "debtp-lucia-3", date: atDay(0, 5), amount: 35000, notes: "Tercer reintegro", transactionId: "tx-may-05-lucia" },
      ],
    },
    {
      id: "debt-mama",
      entityName: "Mamá",
      direction: "they_owe_us",
      originalAmount: 90000,
      remainingBalance: 0,
      notes: "Préstamo puente para obra",
      createdAt: atDay(-5, 9),
      payments: [
        { id: "debtp-mama-1", date: atDay(-5, 21), amount: 30000, notes: "Primer cobro", transactionId: "tx-dec-21-mama" },
        { id: "debtp-mama-2", date: atDay(-3, 26), amount: 30000, notes: "Segundo cobro", transactionId: "tx-feb-26-mama" },
        { id: "debtp-mama-3", date: atDay(-1, 30), amount: 30000, notes: "Saldo final", transactionId: "tx-apr-30-mama" },
      ],
    },
  ];
}

function datasetFull(): PreviewDataset {
  return {
    memberCount: 4,
    categories,
    methods,
    accounts,
    banks,
    transactions: baseTransactionsFull(),
    bills: baseBillsFull(),
    debts: baseDebtsFull(),
  };
}

function datasetLite(): PreviewDataset {
  return {
    memberCount: 2,
    categories,
    methods: methods.slice(0, 4),
    accounts: accounts.slice(0, 2),
    banks: banks.slice(0, 2),
    transactions: [
      { id: "tx-lite-salary", date: atDay(0, 8), amount: 240000, type: "income", detail: "Sueldo Guido", accountId: "account-main", categoryId: "cat-salary", paymentMethodId: "method-transfer" },
      { id: "tx-lite-grocery", date: atDay(0, 6), amount: 18200, type: "expense", detail: "Compra Día", accountId: "account-main", categoryId: "cat-food", paymentMethodId: "method-debit-bank" },
      { id: "tx-lite-pet", date: atDay(0, 3), amount: 6900, type: "expense", detail: "Pipeta Mora", accountId: "account-main", categoryId: "cat-pets", paymentMethodId: "method-mp" },
      { id: "tx-lite-prev", date: atDay(-1, 24), amount: 230000, type: "income", detail: "Sueldo Guido", accountId: "account-main", categoryId: "cat-salary", paymentMethodId: "method-transfer" },
      { id: "tx-lite-prev2", date: atDay(-1, 14), amount: 25000, type: "expense", detail: "Super", accountId: "account-main", categoryId: "cat-food", paymentMethodId: "method-debit-bank" },
    ],
    bills: [
      {
        id: "bill-lite-internet",
        name: "Internet",
        icon: "wifi",
        amount: 22000,
        dueDay: 12,
        notes: "Plan hogar",
        paymentMethodId: "method-auto-debit",
        defaultCategoryId: "cat-service",
        payments: [
          { id: "billp-lite-may", amount: 22000, issuedAt: atDay(0, 5), dueDate: atDay(0, 12), paidAt: null, notes: null, paymentMethodId: "method-auto-debit", transactionId: null },
        ],
      },
    ],
    debts: [
      {
        id: "debt-lite-ana",
        entityName: "Ana",
        direction: "we_owe",
        originalAmount: 30000,
        remainingBalance: 12000,
        notes: "Préstamo viaje",
        createdAt: atDay(-1, 10),
        payments: [{ id: "debtp-lite-1", date: atDay(0, 4), amount: 18000, notes: "Primer pago", transactionId: null }],
      },
    ],
  };
}

function datasetEmpty(): PreviewDataset {
  return {
    memberCount: 2,
    categories,
    methods,
    accounts,
    banks,
    transactions: [],
    bills: [],
    debts: [],
  };
}

export function getPreviewDataset(preset: PreviewPreset): PreviewDataset {
  if (preset === "empty") return datasetEmpty();
  if (preset === "lite") return datasetLite();
  return datasetFull();
}

export function listPreviewMonths(dataset: PreviewDataset) {
  const currentKey = currentPreviewMonthKey();
  const entries = dataset.transactions.reduce((map, row) => {
    const key = keyForMonth(row.date);
    map.set(key, (map.get(key) ?? 0) + 1);
    return map;
  }, new Map<string, number>());

  if (!entries.has(currentKey)) entries.set(currentKey, 0);

  return [...entries.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.key.localeCompare(a.key));
}

export function transactionsForPreviewMonth(dataset: PreviewDataset, monthKey: string) {
  return dataset.transactions
    .filter((row) => keyForMonth(row.date) === monthKey)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function billsForPreviewMonth(dataset: PreviewDataset, monthKey: string) {
  return dataset.bills
    .map((bill) => ({
      ...bill,
      payments: bill.payments
        .filter((payment) => keyForMonth(payment.dueDate) === monthKey)
        .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime()),
    }))
    .filter((bill) => bill.payments.length > 0 || bill.id);
}

export function findPreviewBill(dataset: PreviewDataset, id: string) {
  return dataset.bills.find((bill) => bill.id === id) ?? null;
}

export function findPreviewDebt(dataset: PreviewDataset, id: string) {
  return dataset.debts.find((debt) => debt.id === id) ?? null;
}

function monthWindow(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  const previousStart = new Date(year, month - 2, 1);
  return { start, end, previousStart };
}

export function buildPreviewDashboardSnapshot(dataset: PreviewDataset, monthKey = currentPreviewMonthKey()) {
  const range = monthWindow(monthKey);
  const currentTransactions = transactionsForPreviewMonth(dataset, monthKey);
  const previousTransactions = dataset.transactions.filter((row) => row.date >= range.previousStart && row.date < range.start);
  const incomes = currentTransactions.filter((row) => row.type === "income").reduce((sum, row) => sum + row.amount, 0);
  const expenses = currentTransactions.filter((row) => row.type === "expense").reduce((sum, row) => sum + row.amount, 0);
  const previousExpenses = previousTransactions.filter((row) => row.type === "expense").reduce((sum, row) => sum + row.amount, 0);
  const daysInMonth = new Date(range.end.getFullYear(), range.end.getMonth(), 0).getDate();
  const elapsedDays = Math.max(1, Math.min(new Date().getDate(), daysInMonth));
  const projectedExpenses = Math.round((expenses / elapsedDays) * daysInMonth);
  const pendingBillPayments = dataset.bills.flatMap((bill) =>
    bill.payments
      .filter((payment) => !payment.paidAt && keyForMonth(payment.dueDate) === monthKey)
      .map((payment) => ({ bill, payment })),
  );
  const recurringTotal = pendingBillPayments.reduce((sum, entry) => sum + entry.payment.amount, 0);
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const overdueBillsCount = pendingBillPayments.filter((entry) => entry.payment.dueDate < todayStart).length;
  const activeDebts = dataset.debts.filter((debt) => debt.remainingBalance > 0);
  const weOweTotal = activeDebts.reduce((sum, debt) => sum + (debt.direction === "we_owe" ? debt.remainingBalance : 0), 0);
  const theyOweTotal = activeDebts.reduce((sum, debt) => sum + (debt.direction === "they_owe_us" ? debt.remainingBalance : 0), 0);
  const trendMonths = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(range.start.getFullYear(), range.start.getMonth() + index - 6, 1);
    const key = keyForMonth(date);
    const monthRows = dataset.transactions.filter((row) => keyForMonth(row.date) === key);
    const monthIncomes = monthRows.filter((row) => row.type === "income").reduce((sum, row) => sum + row.amount, 0);
    const monthExpenses = monthRows.filter((row) => row.type === "expense").reduce((sum, row) => sum + row.amount, 0);
    return {
      key,
      label: new Intl.DateTimeFormat("es-AR", { month: "short" }).format(date).replace(".", ""),
      incomes: monthIncomes,
      expenses: monthExpenses,
    };
  });
  const upcomingBills = dataset.bills
    .flatMap((bill) =>
      bill.payments
        .filter((payment) => !payment.paidAt && keyForMonth(payment.dueDate) === monthKey)
        .map((payment) => ({
          id: payment.id,
          recurringBillId: bill.id,
          name: bill.name,
          icon: bill.icon,
          amount: payment.amount,
          dueDate: payment.dueDate,
          dueDay: bill.dueDay,
          paymentMethod:
            payment.paymentMethodId
              ? { name: dataset.methods.find((method) => method.id === payment.paymentMethodId)?.name ?? "Sin medio" }
              : null,
        })),
    )
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .filter((bill) => bill.dueDate >= todayStart)
    .slice(0, 2);

  return {
    monthKey,
    trendMonths,
    incomes,
    expenses,
    previousExpenses,
    projectedExpenses,
    expenseDelta: expenses - previousExpenses,
    savings: incomes - expenses,
    recurringTotal,
    overdueBillsCount,
    weOweTotal,
    theyOweTotal,
    upcomingBills,
    recentTransactions: currentTransactions.slice(0, 8).map((row) => ({
      id: row.id,
      date: row.date,
      detail: row.detail,
      amount: row.amount,
      type: row.type,
      category: {
        name: dataset.categories.find((category) => category.id === row.categoryId)?.name ?? null,
      },
    })),
    updatedAt: new Date(),
    degraded: false,
    degradedReason: null,
  };
}
