import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, MoreHorizontal, Trash2 } from "lucide-react";

import {
  deleteDebtAction,
  deleteDebtPaymentAction,
  saveDebtAction,
  saveDebtPaymentAction,
} from "@/app/actions/resources";
import { ConfirmForm } from "@/components/app/confirm-form";
import { DebtPaymentSheet } from "@/components/app/debt-payment-sheet";
import { AppIconAction } from "@/components/app/icon-action";
import { KineticPage } from "@/components/app/kinetic";
import { MoneyField } from "@/components/app/money-field";
import { ResourceSheet } from "@/components/app/resource-sheet";
import { SegmentedControl } from "@/components/app/segmented-control";
import { SubmitButton } from "@/components/app/submit-button";
import { FlashMessage } from "@/components/flash-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireHousehold } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatArs } from "@/lib/format";
import { findPreviewDebt, getPreviewDataset } from "@/lib/preview-data";
import { getPreviewPreset } from "@/lib/preview-mode";

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
  const previewPreset = await getPreviewPreset();
  const previewDataset = previewPreset ? getPreviewDataset(previewPreset) : null;
  const debt = previewDataset
    ? (() => {
        const previewDebt = findPreviewDebt(previewDataset, id);
        if (!previewDebt) return null;
        return {
          id: previewDebt.id,
          entityName: previewDebt.entityName,
          direction: previewDebt.direction,
          originalAmount: previewDebt.originalAmount,
          remainingBalance: previewDebt.remainingBalance,
          notes: previewDebt.notes,
          payments: [...previewDebt.payments].sort((a, b) => b.date.getTime() - a.date.getTime()),
        };
      })()
    : await prisma.debt.findFirst({
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
  const readOnly = Boolean(previewPreset);

  const isWeOwe = debt.direction === "we_owe";
  const original = Number(debt.originalAmount);
  const remaining = Math.max(0, Number(debt.remainingBalance));
  const paid = Math.max(0, original - remaining);
  const progress = Math.min(100, Math.round((paid / Math.max(original, 1)) * 100));
  const settled = remaining <= 0;
  const initials = debt.entityName.slice(0, 1).toLocaleUpperCase("es-AR");
  const directionLabel = isWeOwe ? "Le debemos a" : "Nos debe";
  const amountClassName = isWeOwe ? "text-red-700" : "text-[var(--income)]";
  const progressLabel = isWeOwe ? "abonado" : "cobrado";
  const outstandingLabel = isWeOwe ? "Saldo pendiente de pago" : "Saldo pendiente de cobro";
  const paymentItemLabel = isWeOwe ? "Abono registrado" : "Cobro registrado";
  const paymentAmountClassName = isWeOwe ? "text-red-700" : "text-[var(--income)]";
  const paymentAmountPrefix = isWeOwe ? "-" : "+";

  const editSheet = readOnly ? null : (
    <ResourceSheet
      title="Editar deuda"
      trigger={
        <AppIconAction asChild>
          <span>
            <MoreHorizontal className="size-5" aria-hidden />
          </span>
        </AppIconAction>
      }
      headerAction={
        <ConfirmForm
          action={deleteDebtAction}
          confirm={`¿Borrar la deuda con “${debt.entityName}”? Esta acción elimina el seguimiento y no se puede deshacer.`}
        >
          <input type="hidden" name="id" value={debt.id} />
          <Button type="submit" size="icon-sm" variant="ghost" aria-label="Eliminar deuda">
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </ConfirmForm>
      }
    >
      <form action={saveDebtAction} className="space-y-4">
        <input type="hidden" name="id" value={debt.id} />
        <input type="hidden" name="remainingBalance" value={String(debt.remainingBalance)} />
        <section className="grouped-form-section space-y-4">
          <SegmentedControl
            name="direction"
            options={[
              { value: "we_owe", label: "Debemos" },
              { value: "they_owe_us", label: "Nos deben" },
            ]}
            defaultValue={isWeOwe ? "we_owe" : "they_owe_us"}
          />
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

  return (
    <KineticPage className="space-y-6">
      <div className="flex items-center justify-between">
        <AppIconAction asChild size="sm" aria-label="Volver a deudas">
          <Link href="/deudas">
            <ArrowLeft className="size-5" aria-hidden />
          </Link>
        </AppIconAction>
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
          <p className="section-eyebrow">{outstandingLabel}</p>
          <p className={`money-hero ${amountClassName}`}>{formatArs(remaining)}</p>
          <p className="row-meta mt-1">{formatArs(paid)} {progressLabel} de {formatArs(original)}</p>
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

      {!settled && !readOnly ? (
        <DebtPaymentSheet
          debtId={debt.id}
          entityName={debt.entityName}
          remaining={remaining}
          direction={debt.direction}
          action={saveDebtPaymentAction}
        />
      ) : null}

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
                <div className={`app-icon-tile ${isWeOwe ? "bg-red-600 text-white" : "bg-[var(--income)] text-white"}`}>
                  <Check className="size-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="row-title truncate">{payment.notes || paymentItemLabel}</p>
                  <p className="row-meta mt-1">{formatDate(payment.date)}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`money-row ${paymentAmountClassName}`}>{paymentAmountPrefix}{formatArs(Number(payment.amount))}</p>
                </div>
                {!readOnly ? (
                  <ConfirmForm
                    action={deleteDebtPaymentAction}
                    confirm={`¿Borrar este ${isWeOwe ? "abono" : "cobro"}? Esta acción no se puede deshacer.`}
                    confirmLabel="Borrar registro"
                  >
                    <input type="hidden" name="id" value={payment.id} />
                    <Button type="submit" variant="ghost" size="icon-sm" aria-label="Eliminar pago">
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </ConfirmForm>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </KineticPage>
  );
}
