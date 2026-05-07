import {
  deleteRecurringBillAction,
  deleteRecurringBillPaymentAction,
  saveRecurringBillAction,
  saveRecurringBillPaymentAction,
} from "@/app/actions/resources";
import { CalendarCheck2, Clock3, ReceiptText, Repeat2, Trash2 } from "lucide-react";

import { ConfirmForm } from "@/components/app/confirm-form";
import { EmptyState } from "@/components/app/empty-state";
import { GroupedSection } from "@/components/app/grouped-section";
import { KineticPage } from "@/components/app/kinetic";
import { MoneyField } from "@/components/app/money-field";
import { PaymentMethodField } from "@/components/app/payment-method-field";
import { ResourceCreateButton, ResourceRowShell, ResourceSheet } from "@/components/app/resource-sheet";
import { ScreenHeader } from "@/components/app/screen-header";
import { SubmitButton } from "@/components/app/submit-button";
import { FlashMessage } from "@/components/flash-message";
import { Button } from "@/components/ui/button";
import { DateField } from "@/components/ui/date-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DayOfMonthField } from "@/components/app/day-of-month-field";
import { requireHousehold } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatArs, formatDate } from "@/lib/format";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function dueDateForDay(day: number) {
  const now = new Date();
  const safeDay = Math.max(1, Math.min(28, day));
  return new Date(now.getFullYear(), now.getMonth(), safeDay).toISOString().slice(0, 10);
}

function isSameMonth(date: Date) {
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function daysUntil(date: Date) {
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return Math.ceil((startDate - startToday) / 86_400_000);
}

export default async function BillsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { household } = await requireHousehold();
  const params = await searchParams;
  const [bills, paymentMethods] = await Promise.all([
    prisma.recurringBill.findMany({
      where: { householdId: household.id, deletedAt: null },
      select: {
        id: true,
        name: true,
        amount: true,
        dueDay: true,
        notes: true,
        paymentMethodId: true,
        paymentMethod: { select: { name: true } },
        payments: {
          where: { deletedAt: null },
          select: {
            id: true,
            amount: true,
            issuedAt: true,
            dueDate: true,
            paidAt: true,
            notes: true,
            paymentMethodId: true,
            paymentMethod: { select: { name: true } },
          },
          orderBy: { dueDate: "desc" },
          take: 12,
        },
      },
      orderBy: [{ dueDay: "asc" }, { name: "asc" }],
    }),
    prisma.paymentMethod.findMany({
      where: { householdId: household.id, isActive: true, deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const quickDays = [...new Set(bills.map((bill) => bill.dueDay))].slice(0, 8);
  const now = new Date();
  const monthLabel = new Intl.DateTimeFormat("es-AR", { month: "long" }).format(now);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const calendarDays = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const billItems = bills.map((bill) => {
    const currentPayment = bill.payments.find((payment) => isSameMonth(payment.dueDate)) ?? null;
    const latestPayment = bill.payments[0] ?? null;
    const dueDate = currentPayment?.dueDate ?? new Date(now.getFullYear(), now.getMonth(), Math.max(1, Math.min(28, bill.dueDay)));
    const amount = Number(currentPayment?.amount ?? latestPayment?.amount ?? bill.amount);
    return {
      bill,
      currentPayment,
      latestPayment,
      dueDate,
      amount,
      paid: Boolean(currentPayment?.paidAt),
    };
  });
  const pendingItems = billItems.filter((item) => !item.paid);
  const paidItems = billItems.filter((item) => item.paid);
  const pendingTotal = pendingItems.reduce((total, item) => total + item.amount, 0);
  const dueDays = new Map(billItems.map((item) => [item.dueDate.getDate(), item.paid ? "paid" : "pending"]));

  const billForm = ({
    id,
    prefix,
    name,
    dueDay,
    paymentMethodId,
    notes,
  }: {
    id?: string;
    prefix: string;
    name?: string;
    dueDay: number;
    paymentMethodId?: string | null;
    notes?: string | null;
  }) => (
    <form action={saveRecurringBillAction} className="space-y-4">
      {id ? <input type="hidden" name="id" value={id} /> : null}
      <input type="hidden" name="amount" value="0" />
      <section className="grouped-form-section space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor={`${prefix}-name`}>Servicio</Label>
          <Input id={`${prefix}-name`} name="name" placeholder="Ej. Internet" defaultValue={name} required autoFocus={!id} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-dueDay`}>Día habitual de vencimiento</Label>
          <DayOfMonthField id={`${prefix}-dueDay`} name="dueDay" defaultValue={dueDay} quickDays={quickDays.length ? quickDays : undefined} />
        </div>
        <div className="space-y-2">
          <Label>Medio habitual</Label>
          <PaymentMethodField name="paymentMethodId" defaultValue={paymentMethodId ?? ""} methods={paymentMethods} quickMethods={paymentMethods} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${prefix}-notes`}>Descripción</Label>
          <Textarea id={`${prefix}-notes`} name="notes" defaultValue={notes ?? ""} placeholder="Ej. Fibra del depto, cliente 1234" />
        </div>
      </section>
      <div className="sheet-action-bar">
        <SubmitButton type="submit" className="w-full" pendingText="Guardando...">
          {id ? "Guardar cambios" : "Crear gasto fijo"}
        </SubmitButton>
      </div>
    </form>
  );

  const paymentForm = (bill: (typeof bills)[number]) => (
    <form action={saveRecurringBillPaymentAction} className="space-y-4">
      <input type="hidden" name="recurringBillId" value={bill.id} />
      <section className="grouped-form-section space-y-4">
        <MoneyField id={`bill-payment-${bill.id}-amount`} name="amount" label="Monto" showPreview={false} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>La factura llegó</Label>
            <DateField name="issuedAt" defaultValue={todayIso()} />
          </div>
          <div className="space-y-1.5">
            <Label>Vence</Label>
            <DateField name="dueDate" defaultValue={dueDateForDay(bill.dueDay)} required />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Pagado el</Label>
          <DateField name="paidAt" placeholder="Todavía no está pago" />
        </div>
        <div className="space-y-2">
          <Label>Medio de pago</Label>
          <PaymentMethodField name="paymentMethodId" defaultValue={bill.paymentMethodId ?? ""} methods={paymentMethods} quickMethods={paymentMethods} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`bill-payment-${bill.id}-notes`}>Nota</Label>
          <Textarea id={`bill-payment-${bill.id}-notes`} name="notes" placeholder="Ej. Factura de mayo" />
        </div>
      </section>
      <div className="sheet-action-bar">
        <SubmitButton type="submit" className="w-full" pendingText="Registrando...">
          Registrar factura
        </SubmitButton>
      </div>
    </form>
  );

  const createBill = (
    <ResourceSheet title="Nuevo gasto fijo" trigger={<ResourceCreateButton />}>
      {billForm({ prefix: "new-bill", dueDay: 10 })}
    </ResourceSheet>
  );

  return (
    <KineticPage className="space-y-5">
      <ScreenHeader title="Gastos fijos" action={createBill} />
      <FlashMessage message={params.error} tone="error" />
      <FlashMessage message={params.message} tone="success" />

      {bills.length === 0 ? (
        <EmptyState icon={Repeat2} title="Todavía no hay gastos fijos" description="Creá el primero para seguir facturas y pagos mensuales." compact />
      ) : (
        <>
          <section className="space-y-3 border-b border-border/70 pb-5">
            <div>
              <p className="section-eyebrow">Pendientes este mes</p>
              <p className="money-hero mt-1 text-amber-700">{formatArs(pendingTotal)}</p>
              <p className="row-meta mt-1">
                {pendingItems.length} servicios sin pagar · {paidItems.length} pagados
              </p>
            </div>
            <div className="flex items-end justify-between gap-4">
              <p className="section-eyebrow">{monthLabel}</p>
              <p className="row-meta">Hoy {now.getDate()}</p>
            </div>
            <div className="mobile-scroll-row">
              {calendarDays.map((day) => {
                const state = dueDays.get(day);
                const isToday = day === now.getDate();
                return (
                  <span
                    key={day}
                    className={[
                      "grid h-10 w-6 place-items-center rounded-full text-[0.78rem] font-semibold",
                      isToday ? "bg-[var(--finance-green)] text-white" : "bg-muted/45 text-muted-foreground",
                      state === "pending" ? "bg-amber-100 text-amber-800" : "",
                      state === "paid" ? "bg-[var(--income-bg)] text-[var(--income)]" : "",
                    ].join(" ")}
                  >
                    {day}
                  </span>
                );
              })}
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="section-eyebrow">Pendientes</h2>
            {pendingItems.length === 0 ? (
              <EmptyState icon={CalendarCheck2} title="Todo pago este mes" description="No tenés facturas pendientes registradas." compact />
            ) : (
              <div>
                {pendingItems.map(({ bill, dueDate, amount }) => {
                  const remainingDays = daysUntil(dueDate);
                  const dateMeta = remainingDays >= 0 ? `en ${remainingDays} días` : "vencido";
                  return (
                    <BillSheet
                      key={bill.id}
                      bill={bill}
                      trigger={
                        <ResourceRowShell
                          icon={<Repeat2 className="size-4" aria-hidden />}
                          title={bill.name}
                          meta={`Vence ${formatDate(dueDate)} · ${dateMeta}`}
                          trailing={<p className="money-row text-right">{amount > 0 ? formatArs(amount) : "Sin factura"}</p>}
                        />
                      }
                    />
                  );
                })}
              </div>
            )}
          </section>

          {paidItems.length > 0 ? (
            <section className="space-y-2">
              <h2 className="section-eyebrow">Pagados</h2>
              <div>
                {paidItems.map(({ bill, amount }) => (
                  <BillSheet
                    key={bill.id}
                    bill={bill}
                    trigger={
                      <ResourceRowShell
                        icon={<CalendarCheck2 className="size-4" aria-hidden />}
                        title={bill.name}
                        meta={`~día ${bill.dueDay} · ${bill.paymentMethod?.name ?? "Sin medio"}`}
                        trailing={
                          <span className="inline-flex items-center gap-3 text-muted-foreground">
                            <CalendarCheck2 className="size-4 text-[var(--income)]" aria-hidden />
                            <span className="money-row">{formatArs(amount)}</span>
                          </span>
                        }
                      />
                    }
                  />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </KineticPage>
  );

  function BillSheet({
    bill,
    trigger,
  }: {
    bill: (typeof bills)[number];
    trigger: React.ReactNode;
  }) {
    return (
                <ResourceSheet
                  title={bill.name}
                  headerAction={
                    <ConfirmForm action={deleteRecurringBillAction} confirm={`¿Borrar el gasto fijo “${bill.name}”? Esta acción no se puede deshacer.`}>
                      <input type="hidden" name="id" value={bill.id} />
                      <Button type="submit" variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="Borrar gasto fijo">
                        <Trash2 className="size-4" aria-hidden />
                      </Button>
                    </ConfirmForm>
                  }
                  trigger={trigger}
                >
                  <div className="space-y-6">
                    <GroupedSection title="Detalle">
                      {billForm({
                        id: bill.id,
                        prefix: `bill-${bill.id}`,
                        name: bill.name,
                        dueDay: bill.dueDay,
                        paymentMethodId: bill.paymentMethodId,
                        notes: bill.notes,
                      })}
                    </GroupedSection>

                    <GroupedSection title="Nueva factura">
                      {paymentForm(bill)}
                    </GroupedSection>

                    <GroupedSection title="Historial">
                      {bill.payments.length === 0 ? (
                        <EmptyState icon={ReceiptText} title="Sin facturas registradas" description="Acá vas a ver cuánto vino cada mes y cuándo se pagó." compact />
                      ) : (
                        <div>
                          {bill.payments.map((payment) => (
                            <ResourceRowShell
                              key={payment.id}
                              icon={payment.paidAt ? <CalendarCheck2 className="size-4" aria-hidden /> : <Clock3 className="size-4" aria-hidden />}
                              title={formatArs(payment.amount)}
                              meta={`${payment.paidAt ? `Pagado ${formatDate(payment.paidAt)}` : `Vence ${formatDate(payment.dueDate)}`} · ${payment.paymentMethod?.name ?? "Sin medio"}`}
                              trailing={
                                <ConfirmForm action={deleteRecurringBillPaymentAction} confirm="¿Borrar esta factura?">
                                  <input type="hidden" name="id" value={payment.id} />
                                  <Button type="submit" variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" aria-label="Borrar factura">
                                    <Trash2 className="size-4" aria-hidden />
                                  </Button>
                                </ConfirmForm>
                              }
                            />
                          ))}
                        </div>
                      )}
                    </GroupedSection>
                  </div>
                </ResourceSheet>
    );
  }
}
