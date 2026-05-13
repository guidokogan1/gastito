import Link from "next/link";
import { ChevronRight, HandCoins } from "lucide-react";

import { saveDebtAction } from "@/app/actions/resources";
import { EmptyState } from "@/components/app/empty-state";
import { KineticPage } from "@/components/app/kinetic";
import { MoneyField } from "@/components/app/money-field";
import { ResourceCreateButton, ResourceSheet } from "@/components/app/resource-sheet";
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
import { getPreviewPreset, previewLabel } from "@/lib/preview-mode";

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

  const createDebt = (
    <ResourceSheet title="Nueva deuda" trigger={<ResourceCreateButton />}>
      <form action={saveDebtAction} className="space-y-4">
        <section className="grouped-form-section space-y-4">
          <div className="grid grid-cols-2 rounded-full bg-[var(--surface-pill)] p-1">
            {DEBT_DIRECTIONS.map((item) => (
              <label key={item.value} className="cursor-pointer">
                <input type="radio" name="direction" value={item.value} defaultChecked={item.value === "we_owe"} className="peer sr-only" />
                <span className="flex h-11 items-center justify-center rounded-full text-[0.98rem] font-semibold text-muted-foreground peer-checked:bg-background peer-checked:text-foreground peer-checked:shadow-sm">
                  {item.label}
                </span>
              </label>
            ))}
          </div>
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
      <ScreenHeader title="Deudas" action={previewPreset ? undefined : createDebt} />
      <FlashMessage message={params.error} tone="error" />
      <FlashMessage message={params.message} tone="success" />
      {previewPreset ? <FlashMessage message={`Preview ${previewLabel(previewPreset)} activo en modo solo lectura.`} tone="warning" /> : null}

      {debts.length === 0 ? (
        <EmptyState icon={HandCoins} title="Todavía no hay deudas" description="Agregá la primera para seguir pagos y saldos sin planillas." compact />
      ) : (
        <>
          <section className="grid grid-cols-2 gap-5 border-b border-border/70 pb-5">
            <div className="border-r border-border/70 pr-5">
              <p className="section-eyebrow"><span className="mr-2 inline-block size-2 rounded-full bg-red-600" />Debemos</p>
              <p className="stat-value mt-2">{formatArs(weOweTotal)}</p>
              <p className="row-meta mt-1">{weOweItems.length} activas</p>
            </div>
            <div>
              <p className="section-eyebrow"><span className="mr-2 inline-block size-2 rounded-full bg-[var(--income)]" />Nos deben</p>
              <p className="stat-value mt-2">{formatArs(theyOweTotal)}</p>
              <p className="row-meta mt-1">{theyOweItems.length} activas</p>
            </div>
          </section>

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
      <div>
        {items.map(({ debt, total, remaining, progress }) => {
          const isWeOwe = debt.direction === "we_owe";
          const colorClass = isWeOwe ? "text-red-700" : "text-[var(--income)]";
          const progressClass = isWeOwe ? "bg-red-600" : "bg-[var(--income)]";
          return (
            <Link key={debt.id} href={`/deudas/${debt.id}`} className="block border-b border-border/70 py-3 last:border-b-0">
              <div className="flex items-center gap-3.5">
                <div className="app-icon-tile font-semibold">{debt.entityName.slice(0, 1).toLocaleUpperCase("es-AR")}</div>
                <div className="min-w-0 flex-1">
                  <p className="row-title truncate">{debt.entityName}</p>
                  <p className="row-meta mt-1 truncate">
                    {settled ? "Saldada" : isWeOwe ? "Le debemos" : "Nos debe"} · {debt.notes ?? "Sin motivo"}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`money-row ${settled ? "text-muted-foreground" : colorClass}`}>{settled ? "Saldada" : formatArs(remaining)}</p>
                  {!settled ? <p className="row-meta">de {formatArs(total)}</p> : null}
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground/70" />
              </div>
              {!settled ? (
                <div className="ml-[3.35rem] mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full ${progressClass}`} style={{ width: `${progress}%` }} />
                </div>
              ) : null}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
