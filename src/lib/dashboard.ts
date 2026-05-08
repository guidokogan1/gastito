import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/format";

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function monthRangeFromKey(monthKey?: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(monthKey ?? "");
  const date = match ? new Date(Number(match[1]), Number(match[2]) - 1, 1) : new Date();
  const start = startOfMonth(date);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
  const previousStart = new Date(start.getFullYear(), start.getMonth() - 1, 1);
  return {
    key: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`,
    start,
    end,
    previousStart,
  };
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("es-AR", { month: "short" }).format(date).replace(".", "");
}

function buildEmptyTrendMonths(endMonth: Date) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addMonths(endMonth, index - 6);
    return {
      key: monthKey(date),
      label: monthLabel(date),
      incomes: 0,
      expenses: 0,
    };
  });
}

function isDatabaseUnavailableError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const anyError = error as { code?: unknown; message?: unknown };
  const code = typeof anyError.code === "string" ? anyError.code : "";
  const message = typeof anyError.message === "string" ? anyError.message : "";
  return code === "P1001" || /Can't reach database server/i.test(message);
}

export async function getDashboardSnapshot(householdId: string, monthKey?: string) {
  const range = monthRangeFromKey(monthKey);
  const trendMonthsStart = addMonths(range.start, -6);

  try {
    const [
      recentTransactions,
      incomeTotals,
      expenseTotals,
      previousExpenseTotals,
      categoryTotals,
      pendingBillPayments,
      activeDebts,
      availableMonthBuckets,
      trendTotals,
    ] = await Promise.all([
      prisma.transaction.findMany({
        where: { householdId, deletedAt: null, date: { gte: range.start, lt: range.end } },
        select: {
          id: true,
          date: true,
          detail: true,
          amount: true,
          type: true,
          category: { select: { name: true } },
        },
        orderBy: { date: "desc" },
        take: 8,
      }),
      prisma.transaction.aggregate({
        where: { householdId, deletedAt: null, date: { gte: range.start, lt: range.end }, type: "income" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { householdId, deletedAt: null, date: { gte: range.start, lt: range.end }, type: "expense" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { householdId, deletedAt: null, date: { gte: range.previousStart, lt: range.start }, type: "expense" },
        _sum: { amount: true },
      }),
      prisma.transaction.groupBy({
        by: ["categoryId"],
        where: { householdId, deletedAt: null, date: { gte: range.start, lt: range.end }, type: "expense" },
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
        take: 5,
      }),
      prisma.recurringBillPayment.findMany({
        where: {
          householdId,
          deletedAt: null,
          paidAt: null,
          dueDate: { gte: range.start, lt: range.end },
          recurringBill: { deletedAt: null, isActive: true },
        },
        select: {
          id: true,
          amount: true,
          dueDate: true,
          paymentMethod: { select: { name: true } },
          recurringBill: { select: { name: true, dueDay: true, paymentMethod: { select: { name: true } } } },
        },
        orderBy: { dueDate: "asc" },
        take: 6,
      }),
      prisma.debt.findMany({
        where: { householdId, deletedAt: null, isActive: true },
        select: { id: true, entityName: true, direction: true, remainingBalance: true },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.$queryRaw<{ month: string; count: number }[]>`
        SELECT
          to_char(date_trunc('month', "date"), 'YYYY-MM') AS month,
          count(*)::int AS count
        FROM "Transaction"
        WHERE "householdId" = ${householdId}
          AND "deletedAt" IS NULL
        GROUP BY 1
        ORDER BY 1 DESC
      `,
      prisma.$queryRaw<{ month: string; type: "expense" | "income"; total: unknown }[]>`
        SELECT
          to_char(date_trunc('month', "date"), 'YYYY-MM') AS month,
          "type"::text AS type,
          COALESCE(sum("amount"), 0) AS total
        FROM "Transaction"
        WHERE "householdId" = ${householdId}
          AND "deletedAt" IS NULL
          AND "date" >= ${trendMonthsStart}
          AND "date" < ${range.end}
        GROUP BY 1, 2
        ORDER BY 1 ASC
      `,
    ]);

    const categoryIds = categoryTotals.flatMap((row) => (row.categoryId ? [row.categoryId] : []));
    const categories = await prisma.category.findMany({
      where: { householdId, id: { in: categoryIds }, deletedAt: null },
      select: { id: true, name: true },
    });
    const categoryNames = new Map(categories.map((category) => [category.id, category.name]));

    const incomes = toNumber(incomeTotals._sum.amount ?? 0);
    const expenses = toNumber(expenseTotals._sum.amount ?? 0);
    const previousExpenses = toNumber(previousExpenseTotals._sum.amount ?? 0);
    const today = new Date();
    const isCurrentMonth = today >= range.start && today < range.end;
    const elapsedDays = isCurrentMonth ? Math.max(1, today.getDate()) : new Date(range.end.getTime() - 1).getDate();
    const daysInMonth = new Date(range.end.getTime() - 1).getDate();
    const projectedExpenses = isCurrentMonth ? Math.round((expenses / elapsedDays) * daysInMonth) : expenses;
    const recurringTotal = pendingBillPayments.reduce((acc, payment) => acc + toNumber(payment.amount), 0);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const upcomingBills = pendingBillPayments
      .filter((payment) => !isCurrentMonth || payment.dueDate >= todayStart)
      .slice(0, 4)
      .map((payment) => ({
        id: payment.id,
        name: payment.recurringBill.name,
        amount: payment.amount,
        dueDate: payment.dueDate,
        dueDay: payment.recurringBill.dueDay,
        paymentMethod: payment.paymentMethod ?? payment.recurringBill.paymentMethod,
      }));
    const debtBalance = activeDebts.reduce((acc, debt) => acc + toNumber(debt.remainingBalance), 0);
    const topCategories = categoryTotals.map((row) => ({
      name: row.categoryId ? categoryNames.get(row.categoryId) ?? "Sin categoría" : "Sin categoría",
      total: toNumber(row._sum.amount ?? 0),
    }));
    const trendMonths = buildEmptyTrendMonths(range.start);
    const trendByKey = new Map(trendMonths.map((row) => [row.key, row]));
    for (const row of trendTotals) {
      const month = trendByKey.get(row.month);
      if (!month) continue;
      if (row.type === "income") month.incomes = toNumber(row.total as number | string);
      if (row.type === "expense") month.expenses = toNumber(row.total as number | string);
    }

    const byKey = new Map(availableMonthBuckets.map((row) => [row.month, { key: row.month, count: row.count }]));
    if (!byKey.has(range.key)) byKey.set(range.key, { key: range.key, count: 0 });

    return {
      monthKey: range.key,
      trendMonths,
      incomes,
      expenses,
      previousExpenses,
      projectedExpenses,
      expenseDelta: expenses - previousExpenses,
      savings: incomes - expenses,
      recurringTotal,
      upcomingBills,
      activeDebts,
      debtBalance,
      recentTransactions,
      topCategories,
      availableMonths: [...byKey.values()].sort((a, b) => b.key.localeCompare(a.key)),
      updatedAt: new Date(),
      degraded: false,
      degradedReason: null as null | "db_unavailable",
    };
  } catch (error) {
    return {
      incomes: 0,
      expenses: 0,
      previousExpenses: 0,
      projectedExpenses: 0,
      expenseDelta: 0,
      savings: 0,
      recurringTotal: 0,
      trendMonths: buildEmptyTrendMonths(range.start),
      upcomingBills: [],
      activeDebts: [],
      debtBalance: 0,
      recentTransactions: [],
      topCategories: [],
      availableMonths: [{ key: range.key, count: 0 }],
      monthKey: range.key,
      updatedAt: new Date(),
      degraded: true,
      degradedReason: isDatabaseUnavailableError(error) ? ("db_unavailable" as const) : ("db_unavailable" as const),
    };
  }
}
