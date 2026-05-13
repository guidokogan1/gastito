import Link from "next/link";
import { CalendarCheck2, ChevronRight, Plus, Repeat2, Trash2 } from "lucide-react";

import { saveRecurringBillAction } from "@/app/actions/resources";
import { EmptyState } from "@/components/app/empty-state";
import { KineticPage } from "@/components/app/kinetic";
import { PaymentMethodField } from "@/components/app/payment-method-field";
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
import { formatArs, formatDate } from "@/lib/format";

function isSameMonth(date: Date, reference = new Date()) {
  return date.getFullYear() === reference.getFullYear() && date.getMonth() === reference.getMonth();
}

function daysUntil(date: Date) {
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return Math.ceil((startDate - startToday) / 86_400_000);
}

function billStateMeta(hasInvoice: boolean, remainingDays: number) {
  if (!hasInvoice) {
    return {
      tone: "muted" as const,
      badge: "Sin factura",
    };
  }

  if (remainingDays < 0) {
    return {
      tone: "danger" as const,
      badge: "Vencida",
    };
  }

  if (remainingDays === 0) {
    return {
      tone: "warning" as const,
      badge: "Vence hoy",
    };
  }

  return {
    tone: "warning" as const,
      badge: remainingDays === 1 ? "Vence mañana" : `En ${remainingDays} días`,
  };
}

export default async function BillsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { household } = await requireHousehold();
  const params = await searchParams;
  const [bills, paymentMethods, categories] = await Promise.all([
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
      hasInvoice: Boolean(currentPayment),
    };
  });
  const pendingItems = billItems.filter((item) => !item.paid);
  const paidItems = billItems.filter((item) => item.paid);
  const pendingTotal = pendingItems.reduce((total, item) => total + item.amount, 0);
  const paidTotal = paidItems.reduce((total, item) => total + item.amount, 0);
  const overdueCount = pendingItems.filter((item) => item.hasInvoice && daysUntil(item.dueDate) < 0).length;
  const dueDays = new Map(billItems.map((item) => [item.dueDate.getDate(), item.paid ? "paid" : "pending"]));

  const createBill = (
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
      <ScreenHeader title="Gastos fijos" action={createBill} />
      <FlashMessage message={params.error} tone="error" />
      <FlashMessage message={params.message} tone="success" />

      {bills.length === 0 ? (
        <EmptyState icon={Repeat2} title="Todavía no hay gastos fijos" description="Creá el primero para seguir facturas y pagos mensuales." compact />
      ) : (
        <>
          <section className="space-y-3 border-b border-border/70 pb-5">
            <p className="section-eyebrow">Pendientes este mes</p>
            <p className="money-hero text-amber-700">{formatArs(pendingTotal)}</p>
            <p className="row-meta">
              {pendingItems.length} servicios sin pagar · {paidItems.length} pagados · {formatArs(paidTotal)}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-[0.8rem] font-medium text-amber-800">
                Pendiente
              </span>
              <span className="rounded-full bg-[var(--income-soft)] px-3 py-1 text-[0.8rem] font-medium text-[var(--income)]">
                Pagado
              </span>
              <span className="rounded-full bg-muted px-3 py-1 text-[0.8rem] font-medium text-muted-foreground">
                Sin factura
              </span>
              {overdueCount > 0 ? (
                <span className="rounded-full bg-red-100 px-3 py-1 text-[0.8rem] font-medium text-red-700">
                  {overdueCount} vencid{overdueCount === 1 ? "a" : "as"}
                </span>
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
                return (
                  <span
                    key={day}
                    className={[
                      "grid h-10 w-6 place-items-center rounded-full text-[0.78rem] font-semibold",
                      isToday ? "bg-[var(--finance-green)] text-white" : "bg-muted/45 text-muted-foreground",
                      state === "pending" ? "bg-amber-100 text-amber-800" : "",
                      state === "paid" ? "bg-[var(--income-soft)] text-[var(--income)]" : "",
                    ].join(" ")}
                  >
                    {day}
                  </span>
                );
              })}
            </div>
          </section>

          <BillList title="Pendientes" items={pendingItems} />
          {paidItems.length > 0 ? <BillList title="Pagados" items={paidItems} paid /> : null}
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
        {items.map(({ bill, dueDate, amount, hasInvoice }) => {
          const remainingDays = daysUntil(dueDate);
          const state = billStateMeta(hasInvoice, remainingDays);
          const dateMeta = paid
            ? `~día ${bill.dueDay} · ${bill.paymentMethod?.name ?? "Sin medio"}`
            : hasInvoice
              ? `Vence ${formatDate(dueDate)} · ${state.badge.toLowerCase()}`
              : `Sin factura cargada · vence ~día ${bill.dueDay}`;
          const badgeClassName =
            state.tone === "danger"
              ? "bg-red-100 text-red-700"
              : state.tone === "warning"
                ? "bg-amber-100 text-amber-800"
                : "bg-muted text-muted-foreground";
          return (
            <Link key={bill.id} href={`/gastos-fijos/${bill.id}`} className="grouped-row" data-interactive="true">
              <div className="app-icon-tile rounded-[0.85rem]">
                <Repeat2 className="size-4" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="row-title truncate">{bill.name}</p>
                <p className="row-meta mt-1 truncate">{dateMeta}</p>
                {!paid ? (
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[0.74rem] font-medium ${badgeClassName}`}>
                      {state.badge}
                    </span>
                  </div>
                ) : null}
              </div>
              <div className="shrink-0 text-right">
                {paid ? <CalendarCheck2 className="ml-auto size-4 text-[var(--income)]" aria-hidden /> : null}
                <p className="money-row">{amount > 0 ? formatArs(amount) : "Sin monto"}</p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground/70" aria-hidden />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
