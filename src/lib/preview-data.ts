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
    { id: "tx-may-10-internet", date: atDay(0, 10), amount: 20000, type: "expense", detail: "Internet", accountId: "account-main", categoryId: "cat-service", paymentMethodId: "method-auto-debit" },
    { id: "tx-may-8-salary", date: atDay(0, 8), amount: 500000, type: "income", detail: "Sueldo Mariana", accountId: "account-main", categoryId: "cat-salary", paymentMethodId: "method-transfer" },
    { id: "tx-may-5-spotify", date: atDay(0, 5), amount: 3990, type: "expense", detail: "Spotify Familiar", accountId: "account-main", categoryId: "cat-fun", paymentMethodId: "method-credit-visa" },
    { id: "tx-may-5-nafta", date: atDay(0, 5, 9), amount: 22500, type: "expense", detail: "Nafta YPF", accountId: "account-main", categoryId: "cat-auto", paymentMethodId: "method-debit-bank" },
    { id: "tx-may-3-vet", date: atDay(0, 3), amount: 18200, type: "expense", detail: "Veterinaria Mora", accountId: "account-main", categoryId: "cat-pets", paymentMethodId: "method-mp" },
    { id: "tx-may-2-coto", date: atDay(0, 2), amount: 68400, type: "expense", detail: "Coto — compra semanal", accountId: "account-main", categoryId: "cat-food", paymentMethodId: "method-credit-visa" },
    { id: "tx-apr-27-salary", date: atDay(-1, 27), amount: 820000, type: "income", detail: "Sueldo Mariana", accountId: "account-main", categoryId: "cat-salary", paymentMethodId: "method-transfer" },
    { id: "tx-apr-19-coto", date: atDay(-1, 19), amount: 75400, type: "expense", detail: "Coto — compra semanal", accountId: "account-main", categoryId: "cat-food", paymentMethodId: "method-credit-visa" },
    { id: "tx-apr-12-rent", date: atDay(-1, 12), amount: 42000, type: "expense", detail: "Expensas", accountId: "account-main", categoryId: "cat-home", paymentMethodId: "method-transfer" },
    { id: "tx-mar-25-salary", date: atDay(-2, 25), amount: 810000, type: "income", detail: "Sueldo Mariana", accountId: "account-main", categoryId: "cat-salary", paymentMethodId: "method-transfer" },
    { id: "tx-mar-16-gym", date: atDay(-2, 16), amount: 18000, type: "expense", detail: "Club", accountId: "account-main", categoryId: "cat-health", paymentMethodId: "method-debit-bank" },
    { id: "tx-mar-9-grocery", date: atDay(-2, 9), amount: 63000, type: "expense", detail: "Compra mensual", accountId: "account-main", categoryId: "cat-food", paymentMethodId: "method-credit-visa" },
    { id: "tx-feb-24-salary", date: atDay(-3, 24), amount: 800000, type: "income", detail: "Sueldo Mariana", accountId: "account-main", categoryId: "cat-salary", paymentMethodId: "method-transfer" },
    { id: "tx-feb-10-home", date: atDay(-3, 10), amount: 58000, type: "expense", detail: "Arreglo del lavarropas", accountId: "account-main", categoryId: "cat-home", paymentMethodId: "method-transfer" },
    { id: "tx-jan-26-salary", date: atDay(-4, 26), amount: 790000, type: "income", detail: "Sueldo Mariana", accountId: "account-main", categoryId: "cat-salary", paymentMethodId: "method-transfer" },
    { id: "tx-jan-14-car", date: atDay(-4, 14), amount: 71000, type: "expense", detail: "Service auto", accountId: "account-main", categoryId: "cat-auto", paymentMethodId: "method-credit-visa" },
    { id: "tx-dec-21-bonus", date: atDay(-5, 21), amount: 845000, type: "income", detail: "Sueldo + bono", accountId: "account-main", categoryId: "cat-salary", paymentMethodId: "method-transfer" },
    { id: "tx-dec-10-food", date: atDay(-5, 10), amount: 92000, type: "expense", detail: "Compra mensual", accountId: "account-main", categoryId: "cat-food", paymentMethodId: "method-credit-visa" },
    { id: "tx-nov-18-salary", date: atDay(-6, 18), amount: 760000, type: "income", detail: "Sueldo Mariana", accountId: "account-main", categoryId: "cat-salary", paymentMethodId: "method-transfer" },
    { id: "tx-nov-7-home", date: atDay(-6, 7), amount: 66000, type: "expense", detail: "Compra hogar", accountId: "account-main", categoryId: "cat-home", paymentMethodId: "method-debit-bank" },
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
        { id: "billp-internet-may", amount: 30000, issuedAt: atDay(0, 5), dueDate: atDay(0, 10), paidAt: null, notes: null, paymentMethodId: "method-auto-debit", transactionId: null },
        { id: "billp-internet-apr", amount: 28500, issuedAt: atDay(-1, 4), dueDate: atDay(-1, 9), paidAt: atDay(-1, 9), notes: null, paymentMethodId: "method-auto-debit", transactionId: "tx-apr-9-internet" },
        { id: "billp-internet-mar", amount: 28500, issuedAt: atDay(-2, 7), dueDate: atDay(-2, 12), paidAt: atDay(-2, 12), notes: null, paymentMethodId: "method-auto-debit", transactionId: "tx-mar-12-internet" },
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
        { id: "billp-swiss-may", amount: 142000, issuedAt: atDay(0, 7), dueDate: atDay(0, 21), paidAt: null, notes: null, paymentMethodId: "method-transfer", transactionId: null },
        { id: "billp-swiss-apr", amount: 138000, issuedAt: atDay(-1, 8), dueDate: atDay(-1, 20), paidAt: atDay(-1, 18), notes: null, paymentMethodId: "method-transfer", transactionId: "tx-apr-18-swiss" },
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
        { id: "billp-edenor-may", amount: 34000, issuedAt: atDay(0, 1), dueDate: atDay(0, 6), paidAt: atDay(0, 6), notes: null, paymentMethodId: "method-auto-debit", transactionId: "tx-may-6-edenor" },
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
        { id: "billp-spotify-may", amount: 3990, issuedAt: atDay(0, 2), dueDate: atDay(0, 6), paidAt: atDay(0, 6), notes: null, paymentMethodId: "method-credit-visa", transactionId: "tx-may-5-spotify" },
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
      originalAmount: 100000,
      remainingBalance: 50000,
      notes: "Préstamo para arreglo del auto",
      createdAt: atDay(-1, 2),
      payments: [
        { id: "debtp-juan-1", date: atDay(-1, 25), amount: 30000, notes: "Primer pago", transactionId: "tx-apr-25-juan" },
        { id: "debtp-juan-2", date: atDay(0, 2), amount: 20000, notes: "Segundo pago", transactionId: "tx-may-2-juan" },
      ],
    },
    {
      id: "debt-lucia",
      entityName: "Lucía",
      direction: "they_owe_us",
      originalAmount: 45000,
      remainingBalance: 45000,
      notes: "Cena de cumpleaños",
      createdAt: atDay(0, 1),
      payments: [],
    },
    {
      id: "debt-mateo",
      entityName: "Mateo",
      direction: "they_owe_us",
      originalAmount: 20000,
      remainingBalance: 0,
      notes: "Uber compartido",
      createdAt: atDay(-2, 11),
      payments: [
        { id: "debtp-mateo-1", date: atDay(-1, 14), amount: 20000, notes: "Pago completo", transactionId: "tx-apr-14-mateo" },
      ],
    },
  ];
}

function datasetFull(): PreviewDataset {
  return {
    memberCount: 2,
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
    recurringTotal: upcomingBills.reduce((sum, bill) => sum + bill.amount, 0),
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
