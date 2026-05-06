import {
  deleteDebtAction,
  deleteDebtPaymentAction,
  saveDebtAction,
  saveDebtPaymentAction,
} from "@/app/actions/resources";
import { CalendarCheck2, HandCoins, ReceiptText, Trash2 } from "lucide-react";

import { ConfirmForm } from "@/components/app/confirm-form";
import { EmptyState } from "@/components/app/empty-state";
import { GroupedSection } from "@/components/app/grouped-section";
import { KineticPage } from "@/components/app/kinetic";
import { MoneyField } from "@/components/app/money-field";
import { ResourceCreateButton, ResourceRowShell, ResourceSheet } from "@/components/app/resource-sheet";
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

  return (
    <KineticPage>
      <FlashMessage message={params.error} tone="error" />
      <FlashMessage message={params.message} tone="success" />

      <GroupedSection title="Deudas" action={createDebt}>
        {debts.length === 0 ? (
          <EmptyState icon={HandCoins} title="Todavía no hay deudas" description="Agregá la primera para seguir pagos y saldos sin planillas." compact className="m-4" />
        ) : (
          <div>
            {debts.map((debt) => {
              const total = Number(debt.originalAmount);
              const remaining = Math.max(0, Number(debt.remainingBalance));
              const paid = Math.max(0, total - remaining);
              const progress = Math.round((paid / Math.max(total, 1)) * 100);
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
                    <ResourceRowShell
                      icon={<HandCoins className="size-4" aria-hidden />}
                      title={debt.entityName}
                      meta={
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          <span>{debt.direction === "we_owe" ? "Debemos" : "Nos deben"}</span>
                          <span>{progress}% saldado</span>
                          <span>Pagado {formatArs(paid)}</span>
                        </div>
                      }
                      trailing={<p className="money-row text-right">{formatArs(remaining)}</p>}
                    />
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
            })}
          </div>
        )}
      </GroupedSection>
    </KineticPage>
  );
}
