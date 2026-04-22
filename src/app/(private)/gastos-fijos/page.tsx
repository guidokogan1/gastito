import { deleteRecurringBillAction, saveRecurringBillAction } from "@/app/actions/resources";
import { FlashMessage } from "@/components/flash-message";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { CrudLayout } from "@/components/app/crud-layout";
import { Button } from "@/components/ui/button";
import { CheckboxLine } from "@/components/ui/checkbox-line";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardPage } from "@/components/ui/card-page";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireHousehold } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatArs, moneyInputValue } from "@/lib/format";

export default async function BillsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gastos fijos"
        description="Compromisos que vuelven todos los meses, sin importaciones ni perfiles tecnicos."
      />

      <FlashMessage message={params.error} tone="error" />

      <CrudLayout>
        <CardPage>
          <CardHeader className="pb-2">
            <p className="stat-label">Listado</p>
            <CardTitle className="section-title">Gastos fijos</CardTitle>
          </CardHeader>
          <CardContent>
            {bills.length === 0 ? (
              <EmptyState title="Todavia no hay gastos fijos" description="Crea el primero a la derecha." compact />
            ) : (
              <div className="space-y-3">
                {bills.map((bill) => (
                  <div key={bill.id} className="rounded-2xl border border-border/70 bg-card/30 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[1.05rem] font-semibold">{bill.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Vence el dia {bill.dueDay} · {formatArs(bill.amount)} · {bill.paymentMethod?.name || "Sin medio"}
                        </p>
                      </div>
                      <form action={deleteRecurringBillAction}>
                        <input type="hidden" name="id" value={bill.id} />
                        <Button type="submit" variant="destructive" size="sm">
                          Borrar
                        </Button>
                      </form>
                    </div>

                    <form action={saveRecurringBillAction} className="mt-4 grid gap-3 sm:grid-cols-2">
                      <input type="hidden" name="id" value={bill.id} />
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label>Nombre</Label>
                        <Input name="name" defaultValue={bill.name} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Monto</Label>
                        <Input name="amount" type="number" step="0.01" defaultValue={moneyInputValue(bill.amount)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Dia de vencimiento</Label>
                        <Input name="dueDay" type="number" min="1" max="31" defaultValue={bill.dueDay} />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label>Medio de pago</Label>
                        <NativeSelect name="paymentMethodId" defaultValue={bill.paymentMethodId ?? ""}>
                          <option value="">Sin medio</option>
                          {paymentMethods.map((method) => (
                            <option key={method.id} value={method.id}>
                              {method.name}
                            </option>
                          ))}
                        </NativeSelect>
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label>Notas</Label>
                        <Textarea
                          name="notes"
                          defaultValue={bill.notes ?? ""}
                        />
                      </div>
                      <CheckboxLine name="isActive" defaultChecked={bill.isActive} className="sm:col-span-2">
                        Activo
                      </CheckboxLine>
                      <div className="sm:col-span-2">
                        <Button type="submit" variant="secondary">
                          Guardar cambios
                        </Button>
                      </div>
                    </form>
                  </div>
                ))}
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
                <Input id="name" name="name" placeholder="Ej. Internet" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="amount">Monto</Label>
                <Input id="amount" name="amount" type="number" step="0.01" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dueDay">Dia de vencimiento</Label>
                <Input id="dueDay" name="dueDay" type="number" min="1" max="31" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="paymentMethodId">Medio de pago</Label>
                <NativeSelect id="paymentMethodId" name="paymentMethodId" defaultValue="">
                  <option value="">Sin medio</option>
                  {paymentMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.name}
                    </option>
                  ))}
                </NativeSelect>
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
              <Button type="submit" className="w-full">
                Guardar gasto fijo
              </Button>
            </form>
          </CardContent>
        </CardPage>
      </CrudLayout>
    </div>
  );
}
