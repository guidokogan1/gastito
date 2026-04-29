import { deleteRecurringBillAction, saveRecurringBillAction } from "@/app/actions/resources";
import { Repeat2 } from "lucide-react";
import { FlashMessage } from "@/components/flash-message";
import { ConfirmForm } from "@/components/app/confirm-form";
import { KineticPage } from "@/components/app/kinetic";
import { ScreenScaffold } from "@/components/app/screen-scaffold";
import { EmptyState } from "@/components/app/empty-state";
import { SubmitButton } from "@/components/app/submit-button";
import { CheckboxLine } from "@/components/ui/checkbox-line";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DayOfMonthField } from "@/components/app/day-of-month-field";
import { PaymentMethodField } from "@/components/app/payment-method-field";
import { GroupedSection } from "@/components/app/grouped-section";
import { ResourceCreateButton, ResourceRowShell, ResourceSheet } from "@/components/app/resource-sheet";
import { StatusPill } from "@/components/app/pill-chip";
import { requireHousehold } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatArs, moneyInputValue } from "@/lib/format";

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
        isActive: true,
        paymentMethod: { select: { name: true } },
      },
      orderBy: [{ isActive: "desc" }, { dueDay: "asc" }],
    }),
    prisma.paymentMethod.findMany({
      where: { householdId: household.id, isActive: true, deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const quickDays = (() => {
    const counts = new Map<number, number>();
    for (const bill of bills) counts.set(bill.dueDay, (counts.get(bill.dueDay) ?? 0) + 1);
    return [...counts.entries()]
      .sort((a, b) => (b[1] - a[1]) || (a[0] - b[0]))
      .map(([day]) => day)
      .slice(0, 8);
  })();

  const quickPaymentMethods = paymentMethods.slice(0, 6);

  const billForm = ({
    id,
    prefix,
    name,
    amount,
    dueDay,
    paymentMethodId,
    notes,
    isActive = true,
  }: {
    id?: string;
    prefix: string;
    name?: string;
    amount?: string;
    dueDay: number;
    paymentMethodId?: string | null;
    notes?: string | null;
    isActive?: boolean;
  }) => (
    <form action={saveRecurringBillAction} className="space-y-4">
      {id ? <input type="hidden" name="id" value={id} /> : null}
      <section className="grouped-form-section space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor={`${prefix}-name`}>Nombre</Label>
          <Input id={`${prefix}-name`} name="name" placeholder="Ej. Internet" defaultValue={name} required />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`${prefix}-amount`}>Monto mensual</Label>
            <Input id={`${prefix}-amount`} name="amount" type="number" step="0.01" inputMode="decimal" defaultValue={amount} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${prefix}-dueDay`}>Día de vencimiento</Label>
            <DayOfMonthField id={`${prefix}-dueDay`} name="dueDay" defaultValue={dueDay} quickDays={quickDays.length ? quickDays : undefined} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Medio de pago</Label>
          <PaymentMethodField
            name="paymentMethodId"
            defaultValue={paymentMethodId ?? ""}
            methods={paymentMethods}
            quickMethods={quickPaymentMethods}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${prefix}-notes`}>Notas</Label>
          <Textarea id={`${prefix}-notes`} name="notes" defaultValue={notes ?? ""} />
        </div>
        <CheckboxLine name="isActive" defaultChecked={isActive}>Activo</CheckboxLine>
      </section>
      <div className="sheet-action-bar">
        <SubmitButton type="submit" className="w-full" pendingText="Guardando...">
          {id ? "Guardar cambios" : "Guardar gasto fijo"}
        </SubmitButton>
      </div>
    </form>
  );

  return (
    <KineticPage>
      <ScreenScaffold
        title="Gastos fijos"
        description="Compromisos mensuales claros, con vencimiento y medio de pago."
        actions={
          <ResourceSheet title="Nuevo gasto fijo" description="Cargá un compromiso recurrente." trigger={<ResourceCreateButton />}>
            {billForm({ prefix: "new-bill", dueDay: 1, isActive: true })}
          </ResourceSheet>
        }
      >
        <FlashMessage message={params.error} tone="error" />
        <FlashMessage message={params.message} tone="success" />

        <GroupedSection eyebrow="Listado" title="Gastos fijos">
          {bills.length === 0 ? (
            <EmptyState icon={Repeat2} title="Todavía no hay gastos fijos" description="Creá el primero para anticipar los próximos pagos." compact className="m-4" />
          ) : (
            <div>
              {bills.map((bill) => {
                const prefix = `bill-${bill.id}`;
                return (
                  <ResourceSheet
                    key={bill.id}
                    title={bill.name}
                    description="Editar gasto fijo"
                    trigger={
                      <ResourceRowShell
                        icon={<Repeat2 className="size-4" aria-hidden />}
                        title={bill.name}
                        meta={`Día ${bill.dueDay} · anual ${formatArs(Number(bill.amount) * 12)} · ${bill.paymentMethod?.name || "Sin medio"}`}
                        trailing={<div className="text-right"><p className="money-row">{formatArs(bill.amount)}</p><StatusPill tone={bill.isActive ? "success" : "neutral"}>{bill.isActive ? "Activo" : "Pausado"}</StatusPill></div>}
                      />
                    }
                  >
                    {billForm({
                      id: bill.id,
                      prefix,
                      name: bill.name,
                      amount: moneyInputValue(bill.amount),
                      dueDay: bill.dueDay,
                      paymentMethodId: bill.paymentMethodId,
                      notes: bill.notes,
                      isActive: bill.isActive,
                    })}
                    <section className="mt-5 rounded-[1.25rem] border border-destructive/20 bg-destructive/5 p-4">
                      <p className="text-sm font-semibold text-destructive">Zona peligrosa</p>
                      <ConfirmForm action={deleteRecurringBillAction} confirm={`¿Borrar el gasto fijo “${bill.name}”? Esta acción no se puede deshacer.`}>
                        <input type="hidden" name="id" value={bill.id} />
                        <SubmitButton type="submit" variant="destructive" className="mt-3 w-full" pendingText="Borrando...">
                          Borrar gasto fijo
                        </SubmitButton>
                      </ConfirmForm>
                    </section>
                  </ResourceSheet>
                );
              })}
            </div>
          )}
        </GroupedSection>
      </ScreenScaffold>
    </KineticPage>
  );
}
