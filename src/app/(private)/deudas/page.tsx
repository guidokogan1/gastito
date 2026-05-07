import {
  deleteDebtAction,
  deleteDebtPaymentAction,
  saveDebtAction,
  saveDebtPaymentAction,
} from "@/app/actions/resources";
import { CalendarCheck2, ChevronRight, HandCoins, ReceiptText, Trash2 } from "lucide-react";

import { ConfirmForm } from "@/components/app/confirm-form";
import { EmptyState } from "@/components/app/empty-state";
import { GroupedSection } from "@/components/app/grouped-section";
import { KineticPage } from "@/components/app/kinetic";
import { MoneyField } from "@/components/app/money-field";
import { ResourceCreateButton, ResourceRowShell, ResourceSheet } from "@/components/app/resource-sheet";
import { ScreenHeader } from "@/components/app/screen-header";
import { SubmitButton } from "@/components/app/submit-button";
import { FlashMessage } from "@/components/flash-message";
import { Button } from "@/components/ui/button";
import { DateField } from "@/components/ui/date-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireHousehold } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatArs, formatDate, moneyInputValue } from "@/lib/format";

const DEBT_DIRECTIONS = [
  { value: "we_owe", label: "Debemos" },
  { value: "they_owe_us", label: "Nos deben" },
] as const;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default async function DebtsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { household } = await requireHousehold();
  const params = await searchParams;
  const debts = await prisma.debt.findMany({
    where: { householdId: household.id, deletedAt: null },
    select: {
      id: true,
      entityName: true,
      direction: true,
      originalAmount: true,
      remainingBalance: true,
      notes: true,
      createdAt: true,
      payments: {
        where: { deletedAt: null },
        select: { id: true, date: true, amount: true, notes: true },
        orderBy: { date: "desc" },
        take: 12,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const debtForm = ({
    id,
    prefix,
    entityName,
    direction = "we_owe",
    originalAmount,
    paidAmount,
    notes,
  }: {
    id?: string;
    prefix: string;
    entityName?: string;
    direction?: (typeof DEBT_DIRECTIONS)[number]["value"];
    originalAmount?: string;
    paidAmount?: string;
    notes?: string | null;
  }) => (
    <form action={saveDebtAction} className="space-y-4">
      {id ? <input type="hidden" name="id" value={id} /> : null}
      <section className="grouped-form-section space-y-4">
        <div className="grid grid-cols-2 rounded-full bg-[var(--surface-pill)] p-1">
          {DEBT_DIRECTIONS.map((item) => {
            const inputId = `${prefix}-direction-${item.value}`;
            const checked = direction === item.value;
            return (
              <label key={item.value} htmlFor={inputId} className="cursor-pointer">
                <input id={inputId} type="radio" name="direction" value={item.value} defaultChecked={checked} className="peer sr-only" />
                <span className="flex h-11 items-center justify-center rounded-full text-[0.98rem] font-semibold text-muted-foreground transition-colors peer-checked:bg-background peer-checked:text-foreground peer-checked:shadow-sm">
                  {item.label}
                </span>
              </label>
            );
          })}
        </div>
        <MoneyField id={`${prefix}-originalAmount`} name="originalAmount" label="Monto total" defaultValue={originalAmount} showPreview={false} />
        <div className="space-y-1.5">
          <Label htmlFor={`${prefix}-entityName`}>Persona o entidad</Label>
          <Input id={`${prefix}-entityName`} name="entityName" defaultValue={entityName} required autoFocus={!id} placeholder="Ej. Juan, Banco, familia" />
        </div>
        <MoneyField id={`${prefix}-paidAmount`} name="paidAmount" label="Saldo pagado" defaultValue={paidAmount} showPreview={false} />
        <div className="space-y-1.5">
          <Label htmlFor={`${prefix}-notes`}>Notas</Label>
          <Textarea id={`${prefix}-notes`} name="notes" defaultValue={notes ?? ""} placeholder="Ej. Préstamo para arreglo del auto" />
        </div>
      </section>
      <div className="sheet-action-bar">
        <SubmitButton type="submit" className="w-full" pendingText="Guardando...">
          {id ? "Guardar cambios" : "Crear deuda"}
        </SubmitButton>
      </div>
    </form>
  );

  const paymentForm = ({
    debtId,
    id,
    date,
    amount,
    notes,
  }: {
    debtId: string;
    id?: string;
    date?: string;
    amount?: string;
    notes?: string | null;
  }) => (
    <form action={saveDebtPaymentAction} className="space-y-4">
      {id ? <input type="hidden" name="id" value={id} /> : null}
      <input type="hidden" name="debtId" value={debtId} />
      <section className="grouped-form-section space-y-4">
        <MoneyField id={`${id ?? debtId}-payment-amount`} name="amount" label="Monto" defaultValue={amount} showPreview={false} />
        <div className="space-y-1.5">
          <Label>Fecha</Label>
          <DateField name="date" defaultValue={date ?? todayIso()} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${id ?? debtId}-payment-notes`}>Motivo</Label>
          <Textarea id={`${id ?? debtId}-payment-notes`} name="notes" defaultValue={notes ?? ""} placeholder="Ej. Cuota de mayo" />
        </div>
      </section>
      <div className="sheet-action-bar">
        <SubmitButton type="submit" className="w-full" pendingText="Guardando...">
          {id ? "Guardar pago" : "Registrar pago"}
        </SubmitButton>
      </div>
    </form>
  );

  const createDebt = (
    <ResourceSheet title="Nueva deuda" trigger={<ResourceCreateButton />}>
      {debtForm({ prefix: "new-debt", paidAmount: "0" })}
    </ResourceSheet>
  );

  const debtItems = debts.map((debt) => {
    const total = Number(debt.originalAmount);
    const remaining = Math.max(0, Number(debt.remainingBalance));
    const paid = Math.max(0, total - remaining);
    const progress = Math.min(100, Math.round((paid / Math.max(total, 1)) * 100));
    return { debt, total, remaining, paid, progress };
  });
  const activeDebtItems = debtItems.filter((item) => item.remaining > 0);
  const settledDebtItems = debtItems.filter((item) => item.remaining <= 0);
  const weOweItems = activeDebtItems.filter((item) => item.debt.direction === "we_owe");
  const theyOweItems = activeDebtItems.filter((item) => item.debt.direction === "they_owe_us");
  const weOweTotal = weOweItems.reduce((total, item) => total + item.remaining, 0);
  const theyOweTotal = theyOweItems.reduce((total, item) => total + item.remaining, 0);

  function renderDebtItem({ debt, total, remaining, paid, progress }: (typeof debtItems)[number]) {
    const isWeOwe = debt.direction === "we_owe";
    const colorClass = isWeOwe ? "text-red-700" : "text-[var(--income)]";
    const progressClass = isWeOwe ? "bg-red-600" : "bg-[var(--income)]";
    const label = isWeOwe ? "Le debemos" : "Nos debe";

    return (
      <ResourceSheet
        key={debt.id}
        title={debt.entityName}
        headerAction={
          <ConfirmForm action={deleteDebtAction} confirm={`¿Borrar la deuda “${debt.entityName}”? Esta acción no se puede deshacer.`}>
            <input type="hidden" name="id" value={debt.id} />
            <Button type="submit" variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="Borrar deuda">
              <Trash2 className="size-4" aria-hidden />
            </Button>
          </ConfirmForm>
        }
        trigger={
          <div className="border-b border-border/70 py-3 last:border-b-0">
            <div className="flex items-center gap-3.5">
              <div className="app-icon-tile font-semibold">{debt.entityName.slice(0, 1).toLocaleUpperCase("es-AR")}</div>
              <div className="min-w-0 flex-1">
                <p className="row-title truncate">{debt.entityName}</p>
                <p className="row-meta mt-1 truncate">
                  {label} · {debt.notes ?? "Sin motivo"}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className={`money-row ${colorClass}`}>{formatArs(remaining)}</p>
                <p className="row-meta">de {formatArs(total)}</p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground/70" aria-hidden />
            </div>
            <div className="ml-[3.35rem] mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className={`h-full rounded-full ${progressClass}`} style={{ width: `${progress}%` }} />
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          <GroupedSection title="Detalle">
            {debtForm({
              id: debt.id,
              prefix: `debt-${debt.id}`,
              entityName: debt.entityName,
              direction: debt.direction,
              originalAmount: moneyInputValue(debt.originalAmount),
              paidAmount: moneyInputValue(paid),
              notes: debt.notes,
            })}
          </GroupedSection>

          <GroupedSection title="Nuevo pago">
            {paymentForm({ debtId: debt.id })}
          </GroupedSection>

          <GroupedSection title="Historial">
            {debt.payments.length === 0 ? (
              <EmptyState icon={ReceiptText} title="Sin pagos registrados" description="Acá vas a ver cada devolución o pago aplicado a esta deuda." compact />
            ) : (
              <div>
                {debt.payments.map((payment) => (
                  <ResourceSheet
                    key={payment.id}
                    title="Editar pago"
                    headerAction={
                      <ConfirmForm action={deleteDebtPaymentAction} confirm="¿Borrar este pago?">
                        <input type="hidden" name="id" value={payment.id} />
                        <Button type="submit" variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="Borrar pago">
                          <Trash2 className="size-4" aria-hidden />
                        </Button>
                      </ConfirmForm>
                    }
                    trigger={
                      <ResourceRowShell
                        icon={<CalendarCheck2 className="size-4" aria-hidden />}
                        title={formatArs(payment.amount)}
                        meta={`${formatDate(payment.date)}${payment.notes ? ` · ${payment.notes}` : ""}`}
                      />
                    }
                  >
                    {paymentForm({
                      debtId: debt.id,
                      id: payment.id,
                      date: payment.date.toISOString().slice(0, 10),
                      amount: moneyInputValue(payment.amount),
                      notes: payment.notes,
                    })}
                  </ResourceSheet>
                ))}
              </div>
            )}
          </GroupedSection>
        </div>
      </ResourceSheet>
    );
  }

  return (
    <KineticPage className="space-y-5">
      <ScreenHeader title="Deudas" action={createDebt} />
      <FlashMessage message={params.error} tone="error" />
      <FlashMessage message={params.message} tone="success" />

      {debts.length === 0 ? (
        <EmptyState icon={HandCoins} title="Todavía no hay deudas" description="Agregá la primera para seguir pagos y saldos sin planillas." compact />
      ) : (
        <>
          <section className="grid grid-cols-2 gap-5 border-b border-border/70 pb-5">
            <div className="border-r border-border/70 pr-5">
              <p className="section-eyebrow">
                <span className="mr-2 inline-block size-2 rounded-full bg-red-600" />
                Debemos
              </p>
              <p className="stat-value mt-2">{formatArs(weOweTotal)}</p>
              <p className="row-meta mt-1">{weOweItems.length} activas</p>
            </div>
            <div>
              <p className="section-eyebrow">
                <span className="mr-2 inline-block size-2 rounded-full bg-[var(--income)]" />
                Nos deben
              </p>
              <p className="stat-value mt-2">{formatArs(theyOweTotal)}</p>
              <p className="row-meta mt-1">{theyOweItems.length} activas</p>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="section-eyebrow">Activas</h2>
            {activeDebtItems.length === 0 ? (
              <EmptyState icon={CalendarCheck2} title="No hay deudas activas" description="Las deudas saldadas quedan debajo como historial." compact />
            ) : (
              <div>{activeDebtItems.map(renderDebtItem)}</div>
            )}
          </section>

          {settledDebtItems.length > 0 ? (
            <section className="space-y-2">
              <h2 className="section-eyebrow">Saldadas</h2>
              <div>{settledDebtItems.map(renderDebtItem)}</div>
            </section>
          ) : null}
        </>
      )}
    </KineticPage>
  );
}
