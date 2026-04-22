import { deleteDebtAction, saveDebtAction } from "@/app/actions/resources";
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

const DEBT_DIRECTIONS = [
  { value: "we_owe", label: "Debemos" },
  { value: "they_owe_us", label: "Nos deben" },
] as const;

export default async function DebtsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { household } = await requireHousehold();
  const params = await searchParams;
  const debts = await prisma.debt.findMany({
    where: { householdId: household.id, deletedAt: null },
    select: {
      id: true,
      entityName: true,
      direction: true,
      originalAmount: true,
      remainingBalance: true,
      notes: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Deudas"
        description="Sin inversiones ni FX: foco total en el seguimiento simple de saldos."
      />

      <FlashMessage message={params.error} tone="error" />

      <CrudLayout>
        <CardPage>
          <CardHeader className="pb-2">
            <p className="stat-label">Listado</p>
            <CardTitle className="section-title">Deudas del hogar</CardTitle>
          </CardHeader>
          <CardContent>
            {debts.length === 0 ? (
              <EmptyState title="Todavia no hay deudas" description="Crea la primera con el formulario de la derecha." compact />
            ) : (
              <div className="space-y-3">
                {debts.map((debt) => (
                  <div key={debt.id} className="rounded-2xl border border-border/70 bg-card/30 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[1.05rem] font-semibold">{debt.entityName}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {debt.direction === "we_owe" ? "Debemos" : "Nos deben"} · saldo {formatArs(debt.remainingBalance)}
                        </p>
                      </div>
                      <form action={deleteDebtAction}>
                        <input type="hidden" name="id" value={debt.id} />
                        <Button type="submit" variant="destructive" size="sm">
                          Borrar
                        </Button>
                      </form>
                    </div>

                    <form action={saveDebtAction} className="mt-4 grid gap-3 sm:grid-cols-2">
                      <input type="hidden" name="id" value={debt.id} />
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label>Persona o entidad</Label>
                        <Input name="entityName" defaultValue={debt.entityName} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Tipo</Label>
                        <NativeSelect name="direction" defaultValue={debt.direction}>
                          {DEBT_DIRECTIONS.map((d) => (
                            <option key={d.value} value={d.value}>
                              {d.label}
                            </option>
                          ))}
                        </NativeSelect>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Monto original</Label>
                        <Input name="originalAmount" type="number" step="0.01" defaultValue={moneyInputValue(debt.originalAmount)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Saldo pendiente</Label>
                        <Input name="remainingBalance" type="number" step="0.01" defaultValue={moneyInputValue(debt.remainingBalance)} />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label>Notas</Label>
                        <Textarea
                          name="notes"
                          defaultValue={debt.notes ?? ""}
                        />
                      </div>
                      <CheckboxLine name="isActive" defaultChecked={debt.isActive} className="sm:col-span-2">
                        Activa
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
            <p className="stat-label">Nueva</p>
            <CardTitle className="section-title">Nueva deuda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form action={saveDebtAction} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="entityName">Persona o entidad</Label>
                <Input id="entityName" name="entityName" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="direction">Tipo</Label>
                <NativeSelect id="direction" name="direction" defaultValue="we_owe">
                  {DEBT_DIRECTIONS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="originalAmount">Monto original</Label>
                <Input id="originalAmount" name="originalAmount" type="number" step="0.01" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="remainingBalance">Saldo pendiente</Label>
                <Input id="remainingBalance" name="remainingBalance" type="number" step="0.01" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  name="notes"
                />
              </div>
              <CheckboxLine name="isActive" defaultChecked>
                Dejar activa
              </CheckboxLine>
              <Button type="submit" className="w-full">
                Guardar deuda
              </Button>
            </form>
          </CardContent>
        </CardPage>
      </CrudLayout>
    </div>
  );
}
