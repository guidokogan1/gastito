import Link from "next/link";
import { HandCoins } from "lucide-react";

import { saveDebtAction } from "@/app/actions/resources";
import { EmptyState } from "@/components/app/empty-state";
import { FinanceHeroSplit } from "@/components/app/finance-hero";
import { KineticPage } from "@/components/app/kinetic";
import { MoneyField } from "@/components/app/money-field";
import { ResourceCreateButton, ResourceSheet } from "@/components/app/resource-sheet";
import { SegmentedControl } from "@/components/app/segmented-control";
import { ScreenHeader } from "@/components/app/screen-header";
import { SubmitButton } from "@/components/app/submit-button";
import { FlashMessage } from "@/components/flash-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireHousehold } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatArs } from "@/lib/format";
import { getPreviewDataset } from "@/lib/preview-data";
import { getPreviewPreset } from "@/lib/preview-mode";
import { cn } from "@/lib/utils";

const DEBT_DIRECTIONS = [
  { value: "we_owe", label: "Debemos" },
  { value: "they_owe_us", label: "Nos deben" },
] as const;

export default async function DebtsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { household } = await requireHousehold();
  const params = await searchParams;
  const previewPreset = await getPreviewPreset();
  const previewDataset = previewPreset ? getPreviewDataset(previewPreset) : null;
  const debts = previewDataset
    ? previewDataset.debts
        .map((debt) => ({
          id: debt.id,
          entityName: debt.entityName,
          direction: debt.direction,
          originalAmount: debt.originalAmount,
          remainingBalance: debt.remainingBalance,
          notes: debt.notes,
          createdAt: debt.createdAt,
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    : await prisma.debt.findMany({
        where: { householdId: household.id, deletedAt: null },
        select: {
          id: true,
          entityName: true,
          direction: true,
          originalAmount: true,
          remainingBalance: true,
          notes: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

  const items = debts.map((debt) => {
    const total = Number(debt.originalAmount);
    const remaining = Math.max(0, Number(debt.remainingBalance));
    const paid = Math.max(0, total - remaining);
    const progress = Math.min(100, Math.round((paid / Math.max(total, 1)) * 100));
    return { debt, total, remaining, paid, progress };
  });
  const activeItems = items.filter((item) => item.remaining > 0);
  const settledItems = items.filter((item) => item.remaining <= 0);
  const weOweItems = activeItems.filter((item) => item.debt.direction === "we_owe");
  const theyOweItems = activeItems.filter((item) => item.debt.direction === "they_owe_us");
  const weOweTotal = weOweItems.reduce((total, item) => total + item.remaining, 0);
  const theyOweTotal = theyOweItems.reduce((total, item) => total + item.remaining, 0);

  const createDebt = previewPreset ? null : (
    <ResourceSheet title="Nueva deuda" trigger={<ResourceCreateButton />}>
      <form action={saveDebtAction} className="space-y-4">
        <section className="grouped-form-section space-y-4">
          <SegmentedControl name="direction" options={DEBT_DIRECTIONS.map((item) => ({ value: item.value, label: item.label }))} defaultValue="we_owe" size="sm" />
          <MoneyField id="originalAmount" name="originalAmount" label="Monto total" showPreview={false} />
          <input type="hidden" name="paidAmount" value="0" />
          <div className="space-y-1.5">
            <Label htmlFor="entityName">Persona o entidad</Label>
            <Input id="entityName" name="entityName" placeholder="Ej. Juan" required autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Motivo</Label>
            <Textarea id="notes" name="notes" placeholder="Ej. Préstamo arreglo del auto" />
          </div>
        </section>
        <div className="sheet-action-bar">
          <SubmitButton type="submit" className="w-full" pendingText="Creando...">
            Crear deuda
          </SubmitButton>
        </div>
      </form>
    </ResourceSheet>
  );

  return (
    <KineticPage className="space-y-5">
      <ScreenHeader title="Deudas" action={createDebt ?? undefined} />
      <FlashMessage message={params.error} tone="error" />
      <FlashMessage message={params.message} tone="success" />

      {debts.length === 0 ? (
        <EmptyState icon={HandCoins} title="Todavía no hay deudas" description="Agregá la primera para seguir pagos y saldos sin planillas." compact />
      ) : (
        <>
          <FinanceHeroSplit
            items={[
              {
                label: <><span className="mr-2 inline-block size-2 rounded-full bg-red-600" />Debemos</>,
                value: formatArs(weOweTotal),
                meta: `${weOweItems.length} activas`,
                tone: "danger",
              },
              {
                label: <><span className="mr-2 inline-block size-2 rounded-full bg-[var(--income)]" />Nos deben</>,
                value: formatArs(theyOweTotal),
                meta: `${theyOweItems.length} activas`,
                tone: "income",
              },
            ]}
          />

          <DebtList title="Activas" items={activeItems} />
          {settledItems.length > 0 ? <DebtList title="Saldadas" items={settledItems} settled /> : null}
        </>
      )}
    </KineticPage>
  );
}

function DebtList({
  title,
  items,
  settled = false,
}: {
  title: string;
  items: Array<{
    debt: { id: string; entityName: string; direction: "we_owe" | "they_owe_us"; notes: string | null };
    total: number;
    remaining: number;
    progress: number;
  }>;
  settled?: boolean;
}) {
  return (
    <section className="space-y-2">
      <h2 className="section-eyebrow">{title}</h2>
      <div className="space-y-1">
        {items.map(({ debt, total, remaining, progress }) => {
          const isWeOwe = debt.direction === "we_owe";
          const colorClass = isWeOwe ? "text-red-700" : "text-[var(--income)]";
          const progressClass = isWeOwe ? "bg-red-600" : "bg-[var(--income)]";
          const statusLabel = settled
            ? isWeOwe
              ? "Saldada"
              : "Cobrada"
            : isWeOwe
              ? "Pendiente de pago"
              : "Pendiente de cobro";
          const amountMeta = settled
            ? undefined
            : isWeOwe
              ? `de ${formatArs(total)}`
              : `de ${formatArs(total)}`;
          const meta = debt.notes?.trim() || (settled ? statusLabel : isWeOwe ? "Debemos" : "Nos deben");
          return (
            <Link key={debt.id} href={`/deudas/${debt.id}`}>
              <div className="grouped-row" data-interactive="true">
                <div className="app-icon-tile">
                  <span className="text-[0.98rem] font-semibold">{debt.entityName.slice(0, 1).toLocaleUpperCase("es-AR")}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="row-title truncate">{debt.entityName}</p>
                  <p className="row-meta mt-1 truncate">{meta}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={cn("money-row", settled ? "text-muted-foreground" : colorClass)}>
                    {settled ? statusLabel : formatArs(remaining)}
                  </p>
                  {amountMeta ? <p className="row-meta mt-1">{amountMeta}</p> : null}
                </div>
                <span className="ml-2 text-muted-foreground/70" aria-hidden>
                  ›
                </span>
                {!settled ? (
                  <div className="ml-[3.35rem] mt-2 h-1.5 basis-full overflow-hidden rounded-full bg-muted">
                    <div className={cn("h-full rounded-full", progressClass)} style={{ width: `${progress}%` }} />
                  </div>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
