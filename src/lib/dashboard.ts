import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/format";

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isDatabaseUnavailableError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const anyError = error as { code?: unknown; message?: unknown };
  const code = typeof anyError.code === "string" ? anyError.code : "";
  const message = typeof anyError.message === "string" ? anyError.message : "";
  return code === "P1001" || /Can't reach database server/i.test(message);
}

export async function getDashboardSnapshot(householdId: string) {
  const monthStart = startOfMonth(new Date());

  try {
    const [recentTransactions, incomeTotals, expenseTotals, categoryTotals] = await Promise.all([
      prisma.transaction.findMany({
        where: { householdId, deletedAt: null },
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
        where: { householdId, deletedAt: null, date: { gte: monthStart }, type: "income" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { householdId, deletedAt: null, date: { gte: monthStart }, type: "expense" },
        _sum: { amount: true },
      }),
      prisma.transaction.groupBy({
        by: ["categoryId"],
        where: { householdId, deletedAt: null, date: { gte: monthStart }, type: "expense" },
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
        take: 5,
      }),
    ]);

    const categoryIds = categoryTotals.flatMap((row) => (row.categoryId ? [row.categoryId] : []));
    const categories = await prisma.category.findMany({
      where: { householdId, id: { in: categoryIds }, deletedAt: null },
      select: { id: true, name: true },
    });
    const categoryNames = new Map(categories.map((category) => [category.id, category.name]));

    const incomes = toNumber(incomeTotals._sum.amount ?? 0);
    const expenses = toNumber(expenseTotals._sum.amount ?? 0);
    const topCategories = categoryTotals.map((row) => ({
      name: row.categoryId ? categoryNames.get(row.categoryId) ?? "Sin categoría" : "Sin categoría",
      total: toNumber(row._sum.amount ?? 0),
    }));

    return {
      incomes,
      expenses,
      savings: incomes - expenses,
      recentTransactions,
      topCategories,
      degraded: false,
      degradedReason: null as null | "db_unavailable",
    };
  } catch (error) {
    return {
      incomes: 0,
      expenses: 0,
      savings: 0,
      recentTransactions: [],
      topCategories: [],
      degraded: true,
      degradedReason: isDatabaseUnavailableError(error) ? ("db_unavailable" as const) : ("db_unavailable" as const),
    };
  }
}
