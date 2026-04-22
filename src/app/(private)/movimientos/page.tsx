import { deleteTransactionAction, saveTransactionAction } from "@/app/actions/resources";
import { FlashMessage } from "@/components/flash-message";
import { PageHeader } from "@/components/app/page-header";
import { TransactionsPanel } from "@/components/app/transactions-panel";
import { requireHousehold } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { household } = await requireHousehold();
  const params = await searchParams;
  const [transactions, accounts, categories, methods] = await Promise.all([
    prisma.transaction.findMany({
      where: { householdId: household.id, deletedAt: null },
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
      take: 50,
    }),
    prisma.account.findMany({ where: { householdId: household.id, isActive: true, deletedAt: null }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { householdId: household.id, isActive: true, deletedAt: null }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.paymentMethod.findMany({ where: { householdId: household.id, isActive: true, deletedAt: null }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Movimientos"
        description="El corazon del producto: manual, simple y 100% orientado a ARS."
      />

      <FlashMessage message={params.error} tone="error" />

      <TransactionsPanel
        transactions={transactions.map((t) => ({
          id: t.id,
          date: t.date,
          amount: t.amount,
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
      />
    </div>
  );
}
