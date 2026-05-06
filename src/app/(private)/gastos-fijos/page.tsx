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
import { formatArs, formatDate, moneyInputValue } from "@/lib/format";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function dueDateForDay(day: number) {
  const now = new Date();
  const safeDay = Math.max(1, Math.min(28, day));
  return new Date(now.getFullYear(), now.getMonth(), safeDay).toISOString().slice(0, 10);
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
    <KineticPage>
      <FlashMessage message={params.error} tone="error" />
      <FlashMessage message={params.message} tone="success" />

      <GroupedSection title="Gastos fijos" action={createBill}>
        {bills.length === 0 ? (
          <EmptyState icon={Repeat2} title="Todavía no hay gastos fijos" description="Creá el primero para seguir facturas y pagos mensuales." compact className="m-4" />
        ) : (
          <div>
            {bills.map((bill) => {
              const latestPayment = bill.payments[0] ?? null;
              const pending = latestPayment && !latestPayment.paidAt;
              return (
                <ResourceSheet
                  key={bill.id}
                  title={bill.name}
                  headerAction={
                    <ConfirmForm action={deleteRecurringBillAction} confirm={`¿Borrar el gasto fijo “${bill.name}”? Esta acción no se puede deshacer.`}>
                      <input type="hidden" name="id" value={bill.id} />
                      <Button type="submit" variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="Borrar gasto fijo">
                        <Trash2 className="size-4" aria-hidden />
                      </Button>
                    </ConfirmForm>
                  }
                  trigger={
                    <ResourceRowShell
                      icon={<Repeat2 className="size-4" aria-hidden />}
                      title={bill.name}
                      meta={
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          <span>Día {bill.dueDay}</span>
                          <span>{bill.paymentMethod?.name ?? "Sin medio"}</span>
                          {latestPayment ? <span>Última {formatArs(latestPayment.amount)}</span> : <span>Sin facturas</span>}
                        </div>
                      }
                      trailing={pending ? <span className="text-sm font-semibold text-amber-700">Pendiente</span> : null}
                    />
                  }
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
            })}
          </div>
        )}
      </GroupedSection>
    </KineticPage>
  );
}
