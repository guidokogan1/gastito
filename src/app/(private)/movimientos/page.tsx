import { deleteTransactionAction, saveTransactionAction } from "@/app/actions/resources";
import { QueryToast } from "@/components/app/query-toast";
import { MonthSelector } from "@/components/app/month-selector";
import { TransactionsPanel } from "@/components/app/transactions-panel";
import { requireHousehold } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  currentPreviewMonthKey,
  getPreviewDataset,
  listPreviewMonths,
  transactionsForPreviewMonth,
} from "@/lib/preview-data";
import { getPreviewPreset } from "@/lib/preview-mode";

function monthRange(monthKey: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(monthKey);
  if (!match) return null;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  if (!Number.isFinite(year) || !Number.isFinite(monthIndex) || monthIndex < 0 || monthIndex > 11) return null;
  const start = new Date(Date.UTC(year, monthIndex, 1));
  const end = new Date(Date.UTC(year, monthIndex + 1, 1));
  return { start, end };
}

function currentMonthKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; month?: string; compose?: string; type?: string }>;
}) {
  const { household } = await requireHousehold();
  const params = await searchParams;
  const previewPreset = await getPreviewPreset();
  const previewDataset = previewPreset ? getPreviewDataset(previewPreset) : null;
  const monthKey = monthRange(params.month ?? "") ? String(params.month) : (previewPreset ? currentPreviewMonthKey() : currentMonthKey());
  const initialTransactionType = params.type === "income" ? "income" : "expense";
  const range = monthRange(monthKey) ?? monthRange(currentMonthKey());
  if (!range) throw new Error("No se pudo calcular el rango del mes.");

  const [monthBuckets, transactions, accounts, categories, methods] = previewDataset
    ? [
        listPreviewMonths(previewDataset).map((row) => ({ month: row.key, count: row.count })),
        transactionsForPreviewMonth(previewDataset, monthKey).map((row) => ({
          id: row.id,
          date: row.date,
          amount: row.amount,
          type: row.type,
          detail: row.detail,
          accountId: row.accountId,
          categoryId: row.categoryId,
          paymentMethodId: row.paymentMethodId,
          account: { name: previewDataset.accounts.find((account) => account.id === row.accountId)?.name ?? null },
          category: { name: previewDataset.categories.find((category) => category.id === row.categoryId)?.name ?? null },
          paymentMethod: { name: previewDataset.methods.find((method) => method.id === row.paymentMethodId)?.name ?? null },
        })),
        previewDataset.accounts,
        previewDataset.categories,
        previewDataset.methods,
      ]
    : await Promise.all([
        prisma.$queryRaw<{ month: string; count: number }[]>`
          SELECT
            to_char(date_trunc('month', "date"), 'YYYY-MM') AS month,
            count(*)::int AS count
          FROM "Transaction"
          WHERE "householdId" = ${household.id}
            AND "deletedAt" IS NULL
          GROUP BY 1
          ORDER BY 1 DESC
        `,
        prisma.transaction.findMany({
          where: { householdId: household.id, deletedAt: null, date: { gte: range.start, lt: range.end } },
          select: {
            id: true,
            date: true,
            amount: true,
            type: true,
            detail: true,
            accountId: true,
            categoryId: true,
            paymentMethodId: true,
            account: { select: { name: true } },
            category: { select: { name: true } },
            paymentMethod: { select: { name: true } },
          },
          orderBy: { date: "desc" },
          take: 250,
        }),
        prisma.account.findMany({ where: { householdId: household.id, isActive: true, deletedAt: null }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
        prisma.category.findMany({ where: { householdId: household.id, isActive: true, deletedAt: null }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
        prisma.paymentMethod.findMany({ where: { householdId: household.id, isActive: true, deletedAt: null }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
      ]);

  const currentKey = currentMonthKey();
  const availableMonths = (() => {
    const items = monthBuckets.map((row) => ({ key: row.month, count: row.count }));
    const byKey = new Map(items.map((it) => [it.key, it]));

    if (!byKey.has(currentKey)) byKey.set(currentKey, { key: currentKey, count: 0 });
    if (!byKey.has(monthKey)) byKey.set(monthKey, { key: monthKey, count: 0 });

    return [...byKey.values()].sort((a, b) => b.key.localeCompare(a.key));
  })();

  return (
    <>
      <QueryToast message={params.message} error={params.error} />

      <TransactionsPanel
        monthKey={monthKey}
        monthControl={<MonthSelector value={monthKey} availableMonths={availableMonths} variant="pill" />}
        transactions={transactions.map((t) => ({
          id: t.id,
          date: t.date,
          amount: t.amount.toString(),
          type: t.type,
          detail: t.detail,
          accountId: t.accountId,
          categoryId: t.categoryId,
          paymentMethodId: t.paymentMethodId,
          accountName: t.account?.name ?? null,
          categoryName: t.category?.name ?? null,
          paymentMethodName: t.paymentMethod?.name ?? null,
        }))}
        accounts={accounts}
        categories={categories}
        methods={methods}
        saveAction={saveTransactionAction}
        deleteAction={deleteTransactionAction}
        initialComposeOpen={!previewPreset && params.compose === "1"}
        initialTransactionType={initialTransactionType}
        readOnly={Boolean(previewPreset)}
      />
    </>
  );
}
