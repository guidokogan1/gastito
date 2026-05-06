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

function isDatabaseUnavailableError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const anyError = error as { code?: unknown; message?: unknown };
  const code = typeof anyError.code === "string" ? anyError.code : "";
  const message = typeof anyError.message === "string" ? anyError.message : "";
  return code === "P1001" || /Can't reach database server/i.test(message);
}

export async function getDashboardSnapshot(householdId: string, monthKey?: string) {
  const range = monthRangeFromKey(monthKey);

  try {
    const [
      recentTransactions,
      incomeTotals,
      expenseTotals,
      previousExpenseTotals,
      categoryTotals,
      recurringBills,
      activeDebts,
      monthBuckets,
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
      prisma.recurringBill.findMany({
        where: { householdId, deletedAt: null, isActive: true },
        select: { id: true, name: true, amount: true, dueDay: true, paymentMethod: { select: { name: true } } },
        orderBy: { dueDay: "asc" },
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
    const recurringTotal = recurringBills.reduce((acc, bill) => acc + toNumber(bill.amount), 0);
    const upcomingBills = recurringBills
      .filter((bill) => !isCurrentMonth || bill.dueDay >= today.getDate())
      .slice(0, 4);
    const debtBalance = activeDebts.reduce((acc, debt) => acc + toNumber(debt.remainingBalance), 0);
    const topCategories = categoryTotals.map((row) => ({
      name: row.categoryId ? categoryNames.get(row.categoryId) ?? "Sin categoría" : "Sin categoría",
      total: toNumber(row._sum.amount ?? 0),
    }));
    const byKey = new Map(monthBuckets.map((row) => [row.month, { key: row.month, count: row.count }]));
    if (!byKey.has(range.key)) byKey.set(range.key, { key: range.key, count: 0 });

    return {
      monthKey: range.key,
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
