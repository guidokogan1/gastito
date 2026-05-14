import Link from "next/link";
import { CalendarCheck2, Plus, Repeat2, Trash2 } from "lucide-react";

import { saveRecurringBillAction } from "@/app/actions/resources";
import { EntityListRow } from "@/components/app/entity-list-row";
import { EmptyState } from "@/components/app/empty-state";
import { FinanceHero } from "@/components/app/finance-hero";
import { KineticPage } from "@/components/app/kinetic";
import { PaymentMethodField } from "@/components/app/payment-method-field";
import { PillChip } from "@/components/app/pill-chip";
import { ResourceCreateButton, ResourceSheet } from "@/components/app/resource-sheet";
import { ScreenHeader } from "@/components/app/screen-header";
import { SubmitButton } from "@/components/app/submit-button";
import { FlashMessage } from "@/components/flash-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DayOfMonthField } from "@/components/app/day-of-month-field";
import { requireHousehold } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatArs } from "@/lib/format";
import { getPreviewDataset } from "@/lib/preview-data";
import { getPreviewPreset } from "@/lib/preview-mode";

function isSameMonth(date: Date, reference = new Date()) {
  return date.getFullYear() === reference.getFullYear() && date.getMonth() === reference.getMonth();
}

function daysUntil(date: Date) {
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return Math.ceil((startDate - startToday) / 86_400_000);
}

function billStateMeta(hasInvoice: boolean, remainingDays: number, shortDate: string) {
  if (!hasInvoice) {
    return {
      tone: "muted" as const,
      summary: "Sin factura",
    };
  }

  if (remainingDays < 0) {
    return {
      tone: "danger" as const,
      summary: `Venció ${shortDate}`,
    };
  }

  if (remainingDays === 0) {
    return {
      tone: "warning" as const,
      summary: "Vence hoy",
    };
  }

  return {
    tone: "warning" as const,
    summary: remainingDays === 1 ? "Vence mañana" : `Vence ${shortDate} · en ${remainingDays} días`,
  };
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
  })
    .format(date)
    .replace(".", "");
}

export default async function BillsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; filter?: string }>;
}) {
  const { household } = await requireHousehold();
  const params = await searchParams;
  const previewPreset = await getPreviewPreset();
  const previewDataset = previewPreset ? getPreviewDataset(previewPreset) : null;
  const [bills, paymentMethods, categories] = previewDataset
    ? [
        previewDataset.bills
          .map((bill) => ({
            id: bill.id,
            name: bill.name,
            icon: bill.icon,
            amount: bill.amount,
            dueDay: bill.dueDay,
            notes: bill.notes,
            paymentMethodId: bill.paymentMethodId,
            paymentMethod: bill.paymentMethodId
              ? { name: previewDataset.methods.find((method) => method.id === bill.paymentMethodId)?.name ?? "Sin medio" }
              : null,
            payments: bill.payments
              .map((payment) => ({
                id: payment.id,
                amount: payment.amount,
                dueDate: payment.dueDate,
                paidAt: payment.paidAt,
              }))
              .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime())
              .slice(0, 12),
          }))
          .sort((a, b) => a.dueDay - b.dueDay || a.name.localeCompare(b.name)),
        previewDataset.methods.map((method) => ({ id: method.id, name: method.name })),
        previewDataset.categories.filter((category) => category.kind === "expense").map((category) => ({ id: category.id, name: category.name })),
      ]
    : await Promise.all([
        prisma.recurringBill.findMany({
          where: { householdId: household.id, deletedAt: null },
          select: {
            id: true,
            name: true,
            icon: true,
            amount: true,
            dueDay: true,
            notes: true,
            paymentMethodId: true,
            paymentMethod: { select: { name: true } },
            payments: {
              where: { deletedAt: null },
              select: { id: true, amount: true, dueDate: true, paidAt: true },
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
        prisma.category.findMany({
          where: { householdId: household.id, deletedAt: null, kind: "expense" },
          select: { id: true, name: true },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        }),
      ]);

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const calendarDays = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const monthLabel = new Intl.DateTimeFormat("es-AR", { month: "long" }).format(now);
  const quickDays = [...new Set(bills.map((bill) => bill.dueDay))].slice(0, 8);
  const billItems = bills.map((bill) => {
    const currentPayment = bill.payments.find((payment) => isSameMonth(payment.dueDate, now)) ?? null;
    const dueDate = currentPayment?.dueDate ?? new Date(now.getFullYear(), now.getMonth(), Math.max(1, Math.min(28, bill.dueDay)));
    const amount = Number(currentPayment?.amount ?? 0);
    return {
      bill,
      dueDate,
      amount,
      paid: Boolean(currentPayment?.paidAt),
      paidAt: currentPayment?.paidAt ?? null,
      hasInvoice: Boolean(currentPayment),
    };
  });
  const pendingItems = billItems.filter((item) => !item.paid);
  const paidItems = billItems.filter((item) => item.paid);
  const pendingTotal = pendingItems.reduce((total, item) => total + item.amount, 0);
  const paidTotal = paidItems.reduce((total, item) => total + item.amount, 0);
  const overdueCount = pendingItems.filter((item) => item.hasInvoice && daysUntil(item.dueDate) < 0).length;
  const dueDays = billItems.reduce<Map<number, "pending" | "paid" | "mixed">>((map, item) => {
    const day = item.dueDate.getDate();
    const nextState = item.paid ? "paid" : "pending";
    const currentState = map.get(day);
    if (!currentState) {
      map.set(day, nextState);
      return map;
    }
    if (currentState !== nextState) {
      map.set(day, "mixed");
    }
    return map;
  }, new Map());
  const activeFilter = params.filter ?? "all";
  const noInvoiceItems = pendingItems.filter((item) => !item.hasInvoice);
  const overdueItems = pendingItems.filter((item) => item.hasInvoice && daysUntil(item.dueDate) < 0);
  const pendingFiltered =
    activeFilter === "pending"
      ? pendingItems
      : activeFilter === "no_invoice"
        ? noInvoiceItems
        : activeFilter === "overdue"
          ? overdueItems
          : activeFilter === "paid"
            ? []
            : pendingItems;
  const paidFiltered = activeFilter === "paid" ? paidItems : activeFilter === "all" ? paidItems : [];
  const pendingTitle =
    activeFilter === "no_invoice" ? "Sin factura" : activeFilter === "overdue" ? "Vencidas" : "Pendientes";

  function filterHref(filter: string) {
    return filter === "all" ? "/gastos-fijos" : `/gastos-fijos?filter=${filter}`;
  }

  const createBill = previewPreset ? null : (
    <ResourceSheet title="Nuevo gasto fijo" trigger={<ResourceCreateButton />}>
      <form action={saveRecurringBillAction} className="space-y-4">
        <section className="grouped-form-section space-y-4">
          <input type="hidden" name="amount" value="0" />
          <input type="hidden" name="icon" value="wifi" />
          <div className="space-y-1.5">
            <Label htmlFor="name">Servicio</Label>
            <Input id="name" name="name" placeholder="Ej. Internet Fibertel" required autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDay">Vence cada</Label>
            <DayOfMonthField id="dueDay" name="dueDay" defaultValue={10} quickDays={quickDays.length ? quickDays : undefined} />
          </div>
          <div className="space-y-2">
            <Label>Medio habitual</Label>
            <PaymentMethodField name="paymentMethodId" defaultValue="" methods={paymentMethods} quickMethods={paymentMethods} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultCategoryId">Categoría default</Label>
            <select id="defaultCategoryId" name="defaultCategoryId" className="h-12 w-full rounded-[1rem] bg-[var(--surface-control)] px-4 text-base font-semibold">
              <option value="">Sin categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Descripción</Label>
            <Textarea id="notes" name="notes" placeholder="Cliente, plan contratado, medidor, etc." />
          </div>
        </section>
        <div className="sheet-action-bar">
          <SubmitButton type="submit" className="w-full" pendingText="Creando...">
            Crear gasto fijo
          </SubmitButton>
        </div>
      </form>
    </ResourceSheet>
  );

  return (
    <KineticPage className="space-y-5">
      <ScreenHeader title="Gastos fijos" action={createBill ?? undefined} />
      <FlashMessage message={params.error} tone="error" />
      <FlashMessage message={params.message} tone="success" />

      {bills.length === 0 ? (
        <EmptyState icon={Repeat2} title="Todavía no hay gastos fijos" description="Creá el primero para seguir facturas y pagos mensuales." compact />
      ) : (
        <>
          <section className="space-y-3 border-b border-border/70 pb-5">
            <FinanceHero
              primaryLabel="Pendientes este mes"
              primaryValue={<span className="text-amber-700">{formatArs(pendingTotal)}</span>}
              className="space-y-3"
            />
            <div className="flex flex-wrap gap-2 pt-1">
              <Link href={filterHref("pending")} className="pressable">
                <PillChip active={activeFilter === "pending" || activeFilter === "all"}>Pendiente</PillChip>
              </Link>
              <Link href={filterHref("paid")} className="pressable">
                <PillChip active={activeFilter === "paid"}>Pagado</PillChip>
              </Link>
              <Link href={filterHref("no_invoice")} className="pressable">
                <PillChip active={activeFilter === "no_invoice"}>Sin factura</PillChip>
              </Link>
              {overdueCount > 0 ? (
                <Link href={filterHref("overdue")} className="pressable">
                  <PillChip active={activeFilter === "overdue"}>
                    {overdueCount} vencid{overdueCount === 1 ? "a" : "as"}
                  </PillChip>
                </Link>
              ) : null}
            </div>
            <div className="flex items-end justify-between gap-4 pt-2">
              <p className="section-eyebrow">{monthLabel}</p>
              <p className="row-meta">Hoy {now.getDate()}</p>
            </div>
            <div className="mobile-scroll-row">
              {calendarDays.map((day) => {
                const state = dueDays.get(day);
                const isToday = day === now.getDate();
                const stateClass =
                  state === "pending"
                    ? "bg-amber-100 text-amber-900 shadow-[inset_0_0_0_1px_rgba(180,83,9,0.12)]"
                    : state === "paid"
                      ? "bg-[var(--income-soft)] text-[var(--income)] shadow-[inset_0_0_0_1px_rgba(12,95,70,0.12)]"
                      : state === "mixed"
                        ? "bg-[var(--surface-pill)] text-foreground shadow-[inset_0_0_0_1px_rgba(15,23,42,0.08)]"
                        : "bg-muted/45 text-muted-foreground";
                const dotClass =
                  state === "pending"
                    ? "bg-amber-700"
                    : state === "paid"
                      ? "bg-[var(--income)]"
                      : state === "mixed"
                        ? "bg-foreground"
                        : "bg-transparent";
                return (
                  <span
                    key={day}
                    className={[
                      "flex h-11 w-7 shrink-0 flex-col items-center justify-center rounded-full text-[0.74rem] font-semibold transition-colors",
                      isToday ? "ring-1 ring-[var(--finance-green)]/32 ring-offset-1 ring-offset-[var(--surface-page)]" : "",
                      stateClass,
                    ].join(" ")}
                  >
                    <span>{day}</span>
                    <span className={`mt-0.5 size-2 rounded-full ${dotClass}`} />
                  </span>
                );
              })}
            </div>
          </section>

          {activeFilter !== "paid" ? <BillList title={pendingTitle} items={pendingFiltered} /> : null}
          {paidFiltered.length > 0 ? <BillList title="Pagados" items={paidFiltered} paid /> : null}
        </>
      )}
    </KineticPage>
  );
}

function BillList({
  title,
  items,
  paid = false,
}: {
  title: string;
  items: Array<{
    bill: { id: string; name: string; icon: string; dueDay: number; paymentMethod: { name: string } | null };
    dueDate: Date;
    paidAt?: Date | null;
    amount: number;
    hasInvoice: boolean;
  }>;
  paid?: boolean;
}) {
  if (items.length === 0) {
    return (
      <section className="space-y-2">
        <h2 className="section-eyebrow">{title}</h2>
        <EmptyState icon={CalendarCheck2} title="Todo pago este mes" description="No tenés facturas pendientes registradas." compact />
      </section>
    );
  }

  return (
    <section className="space-y-2">
      <h2 className="section-eyebrow">{title}</h2>
      <div>
        {items.map(({ bill, dueDate, paidAt, amount, hasInvoice }) => {
          const remainingDays = daysUntil(dueDate);
          const shortDate = formatShortDate(dueDate);
          const state = billStateMeta(hasInvoice, remainingDays, shortDate);
          const dateMeta = paid
            ? paidAt
              ? `Pagado el ${formatShortDate(paidAt)}`
              : "Pagado"
            : hasInvoice
              ? state.summary
              : `Sin factura · día ${bill.dueDay}`;
          return (
            <Link key={bill.id} href={`/gastos-fijos/${bill.id}`}>
              <EntityListRow
                icon={<Repeat2 className="size-4" aria-hidden />}
                title={bill.name}
                meta={dateMeta}
                value={amount > 0 ? formatArs(amount) : "Sin monto"}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
