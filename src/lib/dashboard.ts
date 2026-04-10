import { prisma } from "@/lib/db";

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function getDashboardSnapshot(householdId: string) {
  const monthStart = startOfMonth(new Date());

  const [transactions, categoryRows] = await Promise.all([
    prisma.transaction.findMany({
      where: { householdId },
      include: {
        category: true,
        account: true,
        paymentMethod: true,
      },
      orderBy: { date: "desc" },
      take: 8,
    }),
    prisma.transaction.findMany({
      where: {
        householdId,
        date: { gte: monthStart },
        type: "expense",
      },
      include: { category: true },
    }),
  ]);

  const currentMonthRows = await prisma.transaction.findMany({
    where: {
      householdId,
      date: { gte: monthStart },
    },
  });

  let incomes = 0;
  let expenses = 0;
  for (const row of currentMonthRows) {
    if (row.type === "income") incomes += row.amount;
    if (row.type === "expense") expenses += row.amount;
  }

  const byCategory = new Map<string, number>();
  for (const row of categoryRows) {
    const key = row.category?.name ?? "Sin categoría";
    byCategory.set(key, (byCategory.get(key) ?? 0) + row.amount);
  }

  const topCategories = Array.from(byCategory.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return {
    incomes,
    expenses,
    savings: incomes - expenses,
    recentTransactions: transactions,
    topCategories,
  };
}
