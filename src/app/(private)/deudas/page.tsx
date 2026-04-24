import { deleteDebtAction, saveDebtAction } from "@/app/actions/resources";
import { HandCoins } from "lucide-react";
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
  searchParams: Promise<{ error?: string; message?: string }>;
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
      <FlashMessage message={params.message} tone="success" />

      <CrudLayout>
        <CardPage>
          <CardHeader className="pb-2">
            <p className="stat-label">Listado</p>
            <CardTitle className="section-title">Deudas del hogar</CardTitle>
          </CardHeader>
          <CardContent>
            {debts.length === 0 ? (
              <EmptyState
                icon={HandCoins}
                title="Todavía no hay deudas"
                description="Creá la primera con el formulario de la derecha."
                compact
              />
            ) : (
              <div className="space-y-3">
                {debts.map((debt) => {
                  const prefix = `debt-${debt.id}`;
                  return (
                    <div key={debt.id} className="rounded-2xl border border-border/70 bg-card/30 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[1.05rem] font-semibold">{debt.entityName}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {debt.direction === "we_owe" ? "Debemos" : "Nos deben"} · saldo {formatArs(debt.remainingBalance)}
                        </p>
                      </div>
                      <ConfirmForm
                        action={deleteDebtAction}
                        confirm={`¿Borrar la deuda “${debt.entityName}”? Esta acción no se puede deshacer.`}
                      >
                        <input type="hidden" name="id" value={debt.id} />
                        <SubmitButton type="submit" variant="destructive" size="sm" pendingText="Borrando...">
                          Borrar
                        </SubmitButton>
                      </ConfirmForm>
                    </div>

                    <form action={saveDebtAction} className="mt-4 grid gap-3 sm:grid-cols-2">
                      <input type="hidden" name="id" value={debt.id} />
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor={`${prefix}-entityName`}>Persona o entidad</Label>
                        <Input id={`${prefix}-entityName`} name="entityName" defaultValue={debt.entityName} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Tipo</Label>
                        <div className="flex flex-wrap gap-2">
                          {DEBT_DIRECTIONS.map((d) => {
                            const inputId = `${prefix}-direction-${d.value}`;
                            const checked = debt.direction === d.value;
                            return (
                              <label
                                key={d.value}
                                htmlFor={inputId}
                                className="group inline-flex cursor-pointer items-center"
                              >
                                <input
                                  id={inputId}
                                  type="radio"
                                  name="direction"
                                  value={d.value}
                                  defaultChecked={checked}
                                  className="peer sr-only"
                                />
                                <span className="inline-flex h-9 items-center rounded-full border border-border/60 bg-background px-4 text-sm font-medium text-muted-foreground transition-colors peer-checked:border-transparent peer-checked:bg-foreground peer-checked:text-background group-hover:bg-muted/40">
                                  {d.label}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`${prefix}-originalAmount`}>Monto original</Label>
                        <Input
                          id={`${prefix}-originalAmount`}
                          name="originalAmount"
                          type="number"
                          step="0.01"
                          inputMode="decimal"
                          defaultValue={moneyInputValue(debt.originalAmount)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`${prefix}-remainingBalance`}>Saldo pendiente</Label>
                        <Input
                          id={`${prefix}-remainingBalance`}
                          name="remainingBalance"
                          type="number"
                          step="0.01"
                          inputMode="decimal"
                          defaultValue={moneyInputValue(debt.remainingBalance)}
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor={`${prefix}-notes`}>Notas</Label>
                        <Textarea id={`${prefix}-notes`} name="notes" defaultValue={debt.notes ?? ""} />
                      </div>
                      <CheckboxLine name="isActive" defaultChecked={debt.isActive} className="sm:col-span-2">
                        Activa
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
            <p className="stat-label">Nueva</p>
            <CardTitle className="section-title">Nueva deuda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form action={saveDebtAction} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="entityName">Persona o entidad</Label>
                <Input id="entityName" name="entityName" required autoFocus />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <div className="flex flex-wrap gap-2">
                  {DEBT_DIRECTIONS.map((d) => {
                    const inputId = `direction-${d.value}`;
                    const checked = d.value === "we_owe";
                    return (
                      <label key={d.value} htmlFor={inputId} className="group inline-flex cursor-pointer items-center">
                        <input
                          id={inputId}
                          type="radio"
                          name="direction"
                          value={d.value}
                          defaultChecked={checked}
                          className="peer sr-only"
                        />
                        <span className="inline-flex h-9 items-center rounded-full border border-border/60 bg-background px-4 text-sm font-medium text-muted-foreground transition-colors peer-checked:border-transparent peer-checked:bg-foreground peer-checked:text-background group-hover:bg-muted/40">
                          {d.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="originalAmount">Monto original</Label>
                <Input id="originalAmount" name="originalAmount" type="number" step="0.01" inputMode="decimal" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="remainingBalance">Saldo pendiente</Label>
                <Input id="remainingBalance" name="remainingBalance" type="number" step="0.01" inputMode="decimal" required />
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
              <SubmitButton type="submit" className="w-full" pendingText="Guardando...">
                Guardar deuda
              </SubmitButton>
            </form>
          </CardContent>
        </CardPage>
      </CrudLayout>
    </div>
  );
}
