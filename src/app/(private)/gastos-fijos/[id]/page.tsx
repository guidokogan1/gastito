import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarCheck2, Clock3, Repeat2, Trash2 } from "lucide-react";

import {
  deleteRecurringBillAction,
  deleteRecurringBillPaymentAction,
  saveRecurringBillAction,
  saveRecurringBillPaymentAction,
} from "@/app/actions/resources";
import { ConfirmForm } from "@/components/app/confirm-form";
import { EmptyState } from "@/components/app/empty-state";
import { GroupedSection } from "@/components/app/grouped-section";
import { KineticPage } from "@/components/app/kinetic";
import { MoneyField } from "@/components/app/money-field";
import { PaymentMethodField } from "@/components/app/payment-method-field";
import { ResourceRowShell, ResourceSheet } from "@/components/app/resource-sheet";
import { SubmitButton } from "@/components/app/submit-button";
import { FlashMessage } from "@/components/flash-message";
import { Button } from "@/components/ui/button";
import { CheckboxLine } from "@/components/ui/checkbox-line";
import { DateField } from "@/components/ui/date-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DayOfMonthField } from "@/components/app/day-of-month-field";
import { requireHousehold } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatArs, formatDate, moneyInputValue } from "@/lib/format";
import { findPreviewBill, getPreviewDataset } from "@/lib/preview-data";
import { getPreviewPreset } from "@/lib/preview-mode";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function dueDateForDay(day: number) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), Math.max(1, Math.min(28, day))).toISOString().slice(0, 10);
}

function daysUntil(date: Date) {
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return Math.ceil((startDate - startToday) / 86_400_000);
}

export default async function FixedDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { household } = await requireHousehold();
  const { id } = await params;
  const query = await searchParams;
  const previewPreset = await getPreviewPreset();
  const previewDataset = previewPreset ? getPreviewDataset(previewPreset) : null;
  const [bill, paymentMethods, categories] = previewDataset
    ? [
        (() => {
          const previewBill = findPreviewBill(previewDataset, id);
          if (!previewBill) return null;
          return {
            id: previewBill.id,
            name: previewBill.name,
            icon: previewBill.icon,
            amount: previewBill.amount,
            dueDay: previewBill.dueDay,
            notes: previewBill.notes,
            paymentMethodId: previewBill.paymentMethodId,
            defaultCategoryId: previewBill.defaultCategoryId,
            paymentMethod: previewBill.paymentMethodId
              ? { name: previewDataset.methods.find((method) => method.id === previewBill.paymentMethodId)?.name ?? "Sin medio" }
              : null,
            payments: previewBill.payments
              .map((payment) => ({
                id: payment.id,
                amount: payment.amount,
                issuedAt: payment.issuedAt,
                dueDate: payment.dueDate,
                paidAt: payment.paidAt,
                notes: payment.notes,
                paymentMethodId: payment.paymentMethodId,
                paymentMethod: payment.paymentMethodId
                  ? { name: previewDataset.methods.find((method) => method.id === payment.paymentMethodId)?.name ?? "Sin medio" }
                  : null,
                transactionId: payment.transactionId,
              }))
              .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime())
              .slice(0, 24),
          };
        })(),
        previewDataset.methods.map((method) => ({ id: method.id, name: method.name })),
        previewDataset.categories.filter((category) => category.kind === "expense").map((category) => ({ id: category.id, name: category.name })),
      ]
    : await Promise.all([
        prisma.recurringBill.findFirst({
          where: { id, householdId: household.id, deletedAt: null },
          select: {
            id: true,
            name: true,
            icon: true,
            amount: true,
            dueDay: true,
            notes: true,
            paymentMethodId: true,
            defaultCategoryId: true,
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
                transactionId: true,
              },
              orderBy: { dueDate: "desc" },
              take: 24,
            },
          },
        }),
        prisma.paymentMethod.findMany({
          where: { householdId: household.id, isActive: true, deletedAt: null },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        }),
        prisma.category.findMany({
          where: { householdId: household.id, deletedAt: null, kind: "expense" },
          select: { id: true, name: true },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        }),
      ]);
  if (!bill) notFound();
  const readOnly = Boolean(previewPreset);

  const pendingInvoice = bill.payments.find((payment) => !payment.paidAt) ?? null;
  const average =
    bill.payments.length > 0
      ? bill.payments.reduce((total, payment) => total + Number(payment.amount), 0) / bill.payments.length
      : Number(bill.amount);
  const pendingInvoiceDays = pendingInvoice ? daysUntil(pendingInvoice.dueDate) : null;
  const pendingInvoiceBadge = pendingInvoiceDays === null
    ? null
    : pendingInvoiceDays < 0
      ? `Vencida hace ${Math.abs(pendingInvoiceDays)} día${Math.abs(pendingInvoiceDays) === 1 ? "" : "s"}`
      : pendingInvoiceDays === 0
        ? "Vence hoy"
        : pendingInvoiceDays === 1
          ? "Vence mañana"
          : `Vence en ${pendingInvoiceDays} días`;
  const pendingInvoiceToneClass =
    pendingInvoiceDays === null
      ? ""
      : pendingInvoiceDays < 0
        ? "text-red-700"
        : "text-amber-700";

  const editSheet = readOnly ? null : (
    <ResourceSheet title="Editar servicio" triggerAsChild trigger={<Button variant="secondary">Editar servicio</Button>}>
      <form action={saveRecurringBillAction} className="space-y-4">
        <input type="hidden" name="id" value={bill.id} />
        <section className="grouped-form-section space-y-4">
          <MoneyField id="amount" name="amount" label="Monto estimado" defaultValue={moneyInputValue(bill.amount)} showPreview={false} />
          <input type="hidden" name="icon" value={bill.icon} />
          <div className="space-y-1.5">
            <Label htmlFor="name">Servicio</Label>
            <Input id="name" name="name" defaultValue={bill.name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDay">Vence cada</Label>
            <DayOfMonthField id="dueDay" name="dueDay" defaultValue={bill.dueDay} />
          </div>
          <div className="space-y-2">
            <Label>Medio habitual</Label>
            <PaymentMethodField name="paymentMethodId" defaultValue={bill.paymentMethodId ?? ""} methods={paymentMethods} quickMethods={paymentMethods} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultCategoryId">Categoría default</Label>
            <select id="defaultCategoryId" name="defaultCategoryId" defaultValue={bill.defaultCategoryId ?? ""} className="h-12 w-full rounded-[1rem] bg-[var(--surface-control)] px-4 text-base font-semibold">
              <option value="">Sin categoría</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Descripción</Label>
            <Textarea id="notes" name="notes" defaultValue={bill.notes ?? ""} />
          </div>
        </section>
        <div className="sheet-action-bar">
          <SubmitButton type="submit" className="w-full" pendingText="Guardando...">Guardar cambios</SubmitButton>
        </div>
      </form>
    </ResourceSheet>
  );

  const paymentSheet = readOnly ? null : (
    <ResourceSheet title="Registrar pago" triggerAsChild trigger={<Button className="w-full">Registrar pago</Button>}>
      <form action={saveRecurringBillPaymentAction} className="space-y-4">
        <input type="hidden" name="recurringBillId" value={bill.id} />
        <section className="grouped-form-section space-y-4">
          <MoneyField id="payment-amount" name="amount" label="Monto" defaultValue={pendingInvoice ? moneyInputValue(pendingInvoice.amount) : ""} showPreview={false} />
          <input type="hidden" name="issuedAt" value={todayIso()} />
          <div className="space-y-1.5">
            <Label>Vence</Label>
            <DateField name="dueDate" defaultValue={pendingInvoice?.dueDate.toISOString().slice(0, 10) ?? dueDateForDay(bill.dueDay)} required />
          </div>
          <div className="space-y-1.5">
            <Label>Pagado el</Label>
            <DateField name="paidAt" defaultValue={todayIso()} required />
          </div>
          <PaymentMethodField name="paymentMethodId" defaultValue={bill.paymentMethodId ?? ""} methods={paymentMethods} quickMethods={paymentMethods} />
          <input type="hidden" name="categoryId" value={bill.defaultCategoryId ?? ""} />
          <CheckboxLine name="createTransaction" defaultChecked>
            Registrar también como movimiento
          </CheckboxLine>
        </section>
        <div className="sheet-action-bar">
          <SubmitButton type="submit" className="w-full" pendingText="Confirmando...">Confirmar pago</SubmitButton>
        </div>
      </form>
    </ResourceSheet>
  );

  return (
    <KineticPage className="space-y-6">
      <header className="space-y-6">
        <div className="flex items-center justify-between">
          <Button asChild variant="secondary" size="icon" aria-label="Volver a gastos fijos">
            <Link href="/gastos-fijos"><ArrowLeft className="size-5" /></Link>
          </Button>
          {!readOnly ? (
            <ConfirmForm action={deleteRecurringBillAction} confirm={`¿Borrar el gasto fijo “${bill.name}”?`}>
              <input type="hidden" name="id" value={bill.id} />
              <Button type="submit" variant="secondary" size="icon" className="text-destructive" aria-label="Borrar gasto fijo">
                <Trash2 className="size-4" />
              </Button>
            </ConfirmForm>
          ) : null}
        </div>
        <div className="flex items-center gap-4">
          <div className="grid size-16 place-items-center rounded-[1.2rem] bg-muted">
            <Repeat2 className="size-8" />
          </div>
          <div>
            <p className="section-eyebrow">Gasto fijo</p>
            <h1 className="detail-title">{bill.name}</h1>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 border-b border-border/70 pb-5">
          <div><p className="stat-label">Vence ~</p><p className="row-title">Día {bill.dueDay}</p><p className="row-meta">varía por mes</p></div>
          <div><p className="stat-label">Medio</p><p className="row-title truncate">{bill.paymentMethod?.name ?? "Sin medio"}</p></div>
          <div><p className="stat-label">Promedio</p><p className="row-title">{formatArs(average)}</p></div>
        </div>
      </header>

      <FlashMessage message={query.error} tone="error" />
      <FlashMessage message={query.message} tone="success" />

      {pendingInvoice ? (
        <section className="space-y-3 border-b border-border/70 pb-5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="section-eyebrow text-amber-700">Factura pendiente</p>
            {pendingInvoiceBadge ? (
              <span className={`rounded-full px-2.5 py-1 text-[0.74rem] font-medium ${pendingInvoiceDays !== null && pendingInvoiceDays < 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"}`}>
                {pendingInvoiceBadge}
              </span>
            ) : null}
          </div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="row-title">Vence {formatDate(pendingInvoice.dueDate)}</p>
              <p className="row-meta">{pendingInvoice.paymentMethod?.name ?? bill.paymentMethod?.name ?? "Sin medio"}</p>
            </div>
            <p className={`stat-value ${pendingInvoiceToneClass}`}>{formatArs(pendingInvoice.amount)}</p>
          </div>
          {paymentSheet}
        </section>
      ) : (
        <section className="space-y-3 border-b border-border/70 pb-5">
          <p className="section-eyebrow">Factura pendiente</p>
          <p className="row-meta">No hay factura pendiente para este servicio.</p>
          {paymentSheet}
        </section>
      )}

      {bill.notes ? (
        <GroupedSection title="Descripción">
          <p className="text-[1.05rem] font-medium text-foreground">{bill.notes}</p>
        </GroupedSection>
      ) : null}

      <GroupedSection title="Historial">
        {bill.payments.length === 0 ? (
          <EmptyState icon={CalendarCheck2} title="Sin facturas registradas" description="Acá vas a ver cuánto vino cada mes y cuándo se pagó." compact />
        ) : (
          <div className="space-y-2">
            {bill.payments.map((payment) => (
              <div key={payment.id} className="flex items-center gap-2 border-b border-border/70 last:border-b-0">
                <ResourceSheet
                  title={payment.paidAt ? "Editar pago" : "Editar factura"}
                  triggerAsChild
                  trigger={
                    <button type="button" disabled={readOnly} className="min-w-0 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/18 disabled:cursor-default">
                      <ResourceRowShell
                        icon={payment.paidAt ? <CalendarCheck2 className="size-4" /> : <Clock3 className="size-4" />}
                        title={formatArs(payment.amount)}
                        meta={`${payment.paidAt ? `Pagado ${formatDate(payment.paidAt)}` : `Vence ${formatDate(payment.dueDate)}`} · ${payment.transactionId ? "Con movimiento" : "Sin movimiento"}`}
                        interactive={!readOnly}
                        className="border-b-0"
                      />
                    </button>
                  }
                >
                  <form action={saveRecurringBillPaymentAction} className="space-y-4">
                    <input type="hidden" name="id" value={payment.id} />
                    <input type="hidden" name="recurringBillId" value={bill.id} />
                    <section className="grouped-form-section space-y-4">
                      <MoneyField
                        id={`payment-amount-${payment.id}`}
                        name="amount"
                        label="Monto"
                        defaultValue={moneyInputValue(payment.amount)}
                        showPreview={false}
                      />
                      <div className="space-y-1.5">
                        <Label>Emitida el</Label>
                        <DateField name="issuedAt" defaultValue={payment.issuedAt?.toISOString().slice(0, 10) ?? ""} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Vence</Label>
                        <DateField name="dueDate" defaultValue={payment.dueDate.toISOString().slice(0, 10)} required />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Pagado el</Label>
                        <DateField name="paidAt" defaultValue={payment.paidAt?.toISOString().slice(0, 10) ?? ""} />
                      </div>
                      <PaymentMethodField
                        name="paymentMethodId"
                        defaultValue={payment.paymentMethodId ?? bill.paymentMethodId ?? ""}
                        methods={paymentMethods}
                        quickMethods={paymentMethods}
                      />
                      <input type="hidden" name="categoryId" value={bill.defaultCategoryId ?? ""} />
                      <div className="space-y-1.5">
                        <Label htmlFor={`payment-notes-${payment.id}`}>Notas</Label>
                        <Textarea id={`payment-notes-${payment.id}`} name="notes" defaultValue={payment.notes ?? ""} placeholder="Ej. Ajuste, débito, pago parcial" />
                      </div>
                      <CheckboxLine name="createTransaction" defaultChecked={Boolean(payment.transactionId)}>
                        Registrar también como movimiento
                      </CheckboxLine>
                    </section>
                    <div className="sheet-action-bar">
                      <SubmitButton type="submit" className="w-full" pendingText="Guardando...">
                        Guardar cambios
                      </SubmitButton>
                    </div>
                  </form>
                </ResourceSheet>
                <ConfirmForm action={deleteRecurringBillPaymentAction} confirm="¿Borrar esta factura?">
                  <input type="hidden" name="id" value={payment.id} />
                  <Button type="submit" variant="ghost" size="icon-sm" className="shrink-0 text-destructive" aria-label={`Borrar ${payment.paidAt ? "pago" : "factura"}`}>
                    <Trash2 className="size-4" />
                  </Button>
                </ConfirmForm>
              </div>
            ))}
          </div>
        )}
      </GroupedSection>

      <div className="grid gap-2 pb-4">
        {editSheet}
      </div>
    </KineticPage>
  );
}
