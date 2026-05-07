import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, MoreHorizontal, Trash2 } from "lucide-react";

import {
  deleteDebtAction,
  deleteDebtPaymentAction,
  saveDebtAction,
  saveDebtPaymentAction,
} from "@/app/actions/resources";
import { KineticPage } from "@/components/app/kinetic";
import { MoneyField } from "@/components/app/money-field";
import { ResourceSheet } from "@/components/app/resource-sheet";
import { SubmitButton } from "@/components/app/submit-button";
import { FlashMessage } from "@/components/flash-message";
import { Button } from "@/components/ui/button";
import { CheckboxLine } from "@/components/ui/checkbox-line";
import { DateField } from "@/components/ui/date-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireHousehold } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatArs } from "@/lib/format";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(value);
}

export default async function DebtDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { household } = await requireHousehold();
  const [{ id }, messages] = await Promise.all([params, searchParams]);
  const debt = await prisma.debt.findFirst({
    where: { id, householdId: household.id, deletedAt: null },
    select: {
      id: true,
      entityName: true,
      direction: true,
      originalAmount: true,
      remainingBalance: true,
      notes: true,
      payments: {
        where: { deletedAt: null },
        select: { id: true, date: true, amount: true, notes: true, transactionId: true },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!debt) notFound();

  const isWeOwe = debt.direction === "we_owe";
  const original = Number(debt.originalAmount);
  const remaining = Math.max(0, Number(debt.remainingBalance));
  const paid = Math.max(0, original - remaining);
  const progress = Math.min(100, Math.round((paid / Math.max(original, 1)) * 100));
  const settled = remaining <= 0;
  const initials = debt.entityName.slice(0, 1).toLocaleUpperCase("es-AR");
  const directionLabel = isWeOwe ? "Le debemos a" : "Nos debe";
  const amountClassName = isWeOwe ? "text-red-700" : "text-[var(--income)]";

  const editSheet = (
    <ResourceSheet
      title="Editar deuda"
      trigger={
        <span className="inline-grid size-11 place-items-center rounded-full bg-[var(--surface-pill)] text-foreground">
          <MoreHorizontal className="size-5" aria-hidden />
        </span>
      }
      headerAction={
        <form action={deleteDebtAction}>
          <input type="hidden" name="id" value={debt.id} />
          <Button type="submit" size="icon-sm" variant="ghost" aria-label="Eliminar deuda">
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </form>
      }
    >
      <form action={saveDebtAction} className="space-y-4">
        <input type="hidden" name="id" value={debt.id} />
        <input type="hidden" name="remainingBalance" value={String(debt.remainingBalance)} />
        <section className="grouped-form-section space-y-4">
          <div className="grid grid-cols-2 rounded-full bg-[var(--surface-pill)] p-1">
            <label className="cursor-pointer">
              <input type="radio" name="direction" value="we_owe" defaultChecked={isWeOwe} className="peer sr-only" />
              <span className="flex h-12 items-center justify-center rounded-full text-[1rem] font-semibold text-muted-foreground peer-checked:bg-background peer-checked:text-foreground peer-checked:shadow-sm">
                Debemos
              </span>
            </label>
            <label className="cursor-pointer">
              <input type="radio" name="direction" value="they_owe_us" defaultChecked={!isWeOwe} className="peer sr-only" />
              <span className="flex h-12 items-center justify-center rounded-full text-[1rem] font-semibold text-muted-foreground peer-checked:bg-background peer-checked:text-foreground peer-checked:shadow-sm">
                Nos deben
              </span>
            </label>
          </div>
          <MoneyField id="originalAmount" name="originalAmount" label="Monto total" defaultValue={String(debt.originalAmount)} showPreview={false} />
          <div className="space-y-1.5">
            <Label htmlFor="entityName">Persona o entidad</Label>
            <Input id="entityName" name="entityName" defaultValue={debt.entityName} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Motivo</Label>
            <Textarea id="notes" name="notes" defaultValue={debt.notes ?? ""} />
          </div>
        </section>
        <div className="sheet-action-bar">
          <SubmitButton type="submit" className="w-full" pendingText="Guardando...">
            Guardar cambios
          </SubmitButton>
        </div>
      </form>
    </ResourceSheet>
  );

  const registerPaymentSheet = (
    <ResourceSheet title="Registrar pago" trigger={<Button className="w-full">Registrar pago</Button>}>
      <form action={saveDebtPaymentAction} className="space-y-4">
        <input type="hidden" name="debtId" value={debt.id} />
        <section className="grouped-form-section space-y-4">
          <p className="section-eyebrow text-center">Nuevo pago</p>
          <h2 className="text-center text-[1.6rem] font-semibold tracking-[-0.02em]">{debt.entityName}</h2>
          <MoneyField id="amount" name="amount" label="Monto pagado" showPreview={false} />
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="secondary" className="pointer-events-none h-12">
              Mitad · {formatArs(Math.round(remaining / 2))}
            </Button>
            <Button type="button" variant="secondary" className="pointer-events-none h-12">
              Saldar · {formatArs(remaining)}
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label>Fecha</Label>
            <DateField name="date" defaultValue={todayIso()} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="paymentNotes">Motivo</Label>
            <Textarea id="paymentNotes" name="notes" placeholder="Ej. Primer pago" />
          </div>
          <CheckboxLine name="createTransaction" defaultChecked className="flex rounded-[1rem] bg-[var(--surface-pill)] p-4 text-[0.98rem]">
            Registrar también como movimiento
          </CheckboxLine>
        </section>
        <div className="sheet-action-bar">
          <SubmitButton type="submit" className="w-full" pendingText="Confirmando...">
            Confirmar pago
          </SubmitButton>
        </div>
      </form>
    </ResourceSheet>
  );

  return (
    <KineticPage className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="secondary" size="icon-sm" aria-label="Volver a deudas">
          <Link href="/deudas">
            <ArrowLeft className="size-5" aria-hidden />
          </Link>
        </Button>
        {editSheet}
      </div>

      <FlashMessage message={messages.error} tone="error" />
      <FlashMessage message={messages.message} tone="success" />

      <section className="space-y-5 border-b border-border/70 pb-6">
        <div className="flex items-center gap-4">
          <div className="grid size-16 shrink-0 place-items-center rounded-[1.1rem] bg-[var(--surface-pill)] text-[1.7rem] font-semibold">
            {initials}
          </div>
          <div>
            <p className="section-eyebrow">{directionLabel}</p>
            <h1 className="text-[2.3rem] font-semibold leading-none tracking-[-0.035em]">{debt.entityName}</h1>
          </div>
        </div>

        <div>
          <p className="section-eyebrow">Saldo restante</p>
          <p className={`money-hero ${amountClassName}`}>{formatArs(remaining)}</p>
          <p className="row-meta mt-1">{formatArs(paid)} pagado de {formatArs(original)}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className={`h-full rounded-full ${isWeOwe ? "bg-red-600" : "bg-[var(--income)]"}`} style={{ width: `${progress}%` }} />
          </div>
        </div>
      </section>

      {debt.notes ? (
        <section className="space-y-2 border-b border-border/70 pb-5">
          <h2 className="section-eyebrow">Motivo</h2>
          <p className="text-[1.05rem] text-foreground/90">{debt.notes}</p>
        </section>
      ) : null}

      {!settled ? registerPaymentSheet : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-eyebrow">Pagos</h2>
          <span className="row-meta">{debt.payments.length}</span>
        </div>
        {debt.payments.length === 0 ? (
          <p className="row-meta">Todavía no registraste pagos para esta deuda.</p>
        ) : (
          <div>
            {debt.payments.map((payment) => (
              <div key={payment.id} className="flex items-center gap-3.5 border-b border-border/70 py-3 last:border-b-0">
                <div className="app-icon-tile text-[var(--income)]">
                  <Check className="size-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="row-title truncate">{payment.notes || "Pago registrado"}</p>
                  <p className="row-meta mt-1">{formatDate(payment.date)}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="money-row text-[var(--income)]">+{formatArs(Number(payment.amount))}</p>
                  {payment.transactionId ? <p className="row-meta">Movimiento</p> : null}
                </div>
                <form action={deleteDebtPaymentAction}>
                  <input type="hidden" name="id" value={payment.id} />
                  <Button type="submit" variant="ghost" size="icon-sm" aria-label="Eliminar pago">
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </KineticPage>
  );
}
