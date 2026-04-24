import { deleteRecurringBillAction, saveRecurringBillAction } from "@/app/actions/resources";
import { Repeat2 } from "lucide-react";
import { FlashMessage } from "@/components/flash-message";
import { ConfirmForm } from "@/components/app/confirm-form";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { CrudLayout } from "@/components/app/crud-layout";
import { SubmitButton } from "@/components/app/submit-button";
import { CheckboxLine } from "@/components/ui/checkbox-line";
import { Input } from "@/components/ui/input";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardPage } from "@/components/ui/card-page";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DayOfMonthField } from "@/components/app/day-of-month-field";
import { PaymentMethodField } from "@/components/app/payment-method-field";
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
    for (const bill of bills) {
      counts.set(bill.dueDay, (counts.get(bill.dueDay) ?? 0) + 1);
    }
    const ranked = [...counts.entries()]
      .sort((a, b) => (b[1] - a[1]) || (a[0] - b[0]))
      .map(([day]) => day);
    return ranked.slice(0, 8);
  })();

  const quickPaymentMethods = await (async () => {
    try {
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const grouped = await prisma.transaction.groupBy({
        by: ["paymentMethodId"],
        where: {
          householdId: household.id,
          deletedAt: null,
          date: { gte: monthStart },
          paymentMethodId: { not: null },
        },
        _count: { _all: true },
        orderBy: { _count: { paymentMethodId: "desc" } },
        take: 8,
      });

      const ids = grouped.map((row) => row.paymentMethodId).filter(Boolean) as string[];
      const ranked = ids
        .map((id) => paymentMethods.find((method) => method.id === id))
        .filter((method): method is { id: string; name: string } => Boolean(method));
      return ranked.slice(0, 6);
    } catch {
      return paymentMethods.slice(0, 6);
    }
  })();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gastos fijos"
        description="Compromisos que vuelven todos los meses, sin importaciones ni perfiles técnicos."
      />

      <FlashMessage message={params.error} tone="error" />
      <FlashMessage message={params.message} tone="success" />

      <CrudLayout>
        <CardPage>
          <CardHeader className="pb-2">
            <p className="stat-label">Listado</p>
            <CardTitle className="section-title">Gastos fijos</CardTitle>
          </CardHeader>
          <CardContent>
            {bills.length === 0 ? (
              <EmptyState icon={Repeat2} title="Todavía no hay gastos fijos" description="Creá el primero a la derecha." compact />
            ) : (
              <div className="space-y-3">
                {bills.map((bill) => {
                  const prefix = `bill-${bill.id}`;
                  return (
                    <div key={bill.id} className="rounded-2xl border border-border/70 bg-card/30 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[1.05rem] font-semibold">{bill.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Vence el día {bill.dueDay} · {formatArs(bill.amount)} · {bill.paymentMethod?.name || "Sin medio"}
                        </p>
                      </div>
                      <ConfirmForm
                        action={deleteRecurringBillAction}
                        confirm={`¿Borrar el gasto fijo “${bill.name}”? Esta acción no se puede deshacer.`}
                      >
                        <input type="hidden" name="id" value={bill.id} />
                        <SubmitButton type="submit" variant="destructive" size="sm" pendingText="Borrando...">
                          Borrar
                        </SubmitButton>
                      </ConfirmForm>
                    </div>

                    <form action={saveRecurringBillAction} className="mt-4 grid gap-3 sm:grid-cols-2">
                      <input type="hidden" name="id" value={bill.id} />
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor={`${prefix}-name`}>Nombre</Label>
                        <Input id={`${prefix}-name`} name="name" defaultValue={bill.name} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`${prefix}-amount`}>Monto</Label>
                        <Input
                          id={`${prefix}-amount`}
                          name="amount"
                          type="number"
                          step="0.01"
                          inputMode="decimal"
                          defaultValue={moneyInputValue(bill.amount)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`${prefix}-dueDay`}>Día de vencimiento</Label>
                        <DayOfMonthField id={`${prefix}-dueDay`} name="dueDay" defaultValue={bill.dueDay} quickDays={quickDays} />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label>Medio de pago</Label>
                        <PaymentMethodField
                          name="paymentMethodId"
                          defaultValue={bill.paymentMethodId ?? ""}
                          methods={paymentMethods}
                          quickMethods={quickPaymentMethods}
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor={`${prefix}-notes`}>Notas</Label>
                        <Textarea id={`${prefix}-notes`} name="notes" defaultValue={bill.notes ?? ""} />
                      </div>
                      <CheckboxLine name="isActive" defaultChecked={bill.isActive} className="sm:col-span-2">
                        Activo
                      </CheckboxLine>
                      <div className="sm:col-span-2">
                        <SubmitButton type="submit" variant="secondary" pendingText="Guardando...">
                          Guardar cambios
                        </SubmitButton>
                      </div>
                    </form>
                  </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </CardPage>

        <CardPage>
          <CardHeader className="pb-2">
            <p className="stat-label">Nuevo</p>
            <CardTitle className="section-title">Nuevo gasto fijo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form action={saveRecurringBillAction} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" placeholder="Ej. Internet" required autoFocus />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="amount">Monto</Label>
                <Input id="amount" name="amount" type="number" step="0.01" inputMode="decimal" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dueDay">Día de vencimiento</Label>
                <DayOfMonthField id="dueDay" name="dueDay" defaultValue={1} quickDays={quickDays.length ? quickDays : undefined} />
              </div>
              <div className="space-y-1.5">
                <Label>Medio de pago</Label>
                <PaymentMethodField
                  name="paymentMethodId"
                  defaultValue=""
                  methods={paymentMethods}
                  quickMethods={quickPaymentMethods}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  name="notes"
                />
              </div>
              <CheckboxLine name="isActive" defaultChecked>
                Dejar activo
              </CheckboxLine>
              <SubmitButton type="submit" className="w-full" pendingText="Guardando...">
                Guardar gasto fijo
              </SubmitButton>
            </form>
          </CardContent>
        </CardPage>
      </CrudLayout>
    </div>
  );
}
