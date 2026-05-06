import { deleteDebtAction, saveDebtAction } from "@/app/actions/resources";
import { HandCoins, Trash2 } from "lucide-react";
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
import { GroupedSection } from "@/components/app/grouped-section";
import { ResourceCreateButton, ResourceRowShell, ResourceSheet } from "@/components/app/resource-sheet";
import { PillChip, StatusPill } from "@/components/app/pill-chip";
import { Button } from "@/components/ui/button";
import { MoneyField } from "@/components/app/money-field";
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

  const debtForm = ({
    id,
    prefix,
    entityName,
    direction = "we_owe",
    originalAmount,
    remainingBalance,
    notes,
    isActive = true,
  }: {
    id?: string;
    prefix: string;
    entityName?: string;
    direction?: (typeof DEBT_DIRECTIONS)[number]["value"];
    originalAmount?: string;
    remainingBalance?: string;
    notes?: string | null;
    isActive?: boolean;
  }) => (
    <form action={saveDebtAction} className="space-y-4">
      {id ? <input type="hidden" name="id" value={id} /> : null}
      <section className="grouped-form-section space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor={`${prefix}-entityName`}>Persona o entidad</Label>
          <Input id={`${prefix}-entityName`} name="entityName" defaultValue={entityName} required autoFocus={!id} />
        </div>
        <div className="space-y-2">
          <Label>Tipo</Label>
          <div className="flex flex-wrap gap-2">
            {DEBT_DIRECTIONS.map((item) => {
              const inputId = `${prefix}-direction-${item.value}`;
              const checked = direction === item.value;
              return (
                <label key={item.value} htmlFor={inputId} className="cursor-pointer">
                  <input id={inputId} type="radio" name="direction" value={item.value} defaultChecked={checked} className="peer sr-only" />
                  <PillChip active={checked}>{item.label}</PillChip>
                </label>
              );
            })}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`${prefix}-originalAmount`}>Monto original</Label>
            <MoneyField id={`${prefix}-originalAmount`} name="originalAmount" label="Monto original" defaultValue={originalAmount} inputClassName="h-12 rounded-[var(--radius-control)] border border-input bg-[var(--surface-control)] px-4 text-left text-[1rem] tracking-normal focus-visible:ring-[1px]" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${prefix}-remainingBalance`}>Saldo pendiente</Label>
            <MoneyField id={`${prefix}-remainingBalance`} name="remainingBalance" label="Saldo pendiente" defaultValue={remainingBalance} inputClassName="h-12 rounded-[var(--radius-control)] border border-input bg-[var(--surface-control)] px-4 text-left text-[1rem] tracking-normal focus-visible:ring-[1px]" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${prefix}-notes`}>Notas</Label>
          <Textarea id={`${prefix}-notes`} name="notes" defaultValue={notes ?? ""} />
        </div>
        <CheckboxLine name="isActive" defaultChecked={isActive}>Activa</CheckboxLine>
      </section>
      <div className="sheet-action-bar">
        <SubmitButton type="submit" className="w-full" pendingText="Guardando...">
          {id ? "Guardar cambios" : "Guardar deuda"}
        </SubmitButton>
      </div>
    </form>
  );

  return (
    <KineticPage>
      <ScreenScaffold
        title="Deudas"
        actions={
          <ResourceSheet title="Nueva deuda" trigger={<ResourceCreateButton />}>
            {debtForm({ prefix: "new-debt" })}
          </ResourceSheet>
        }
      >
        <FlashMessage message={params.error} tone="error" />
        <FlashMessage message={params.message} tone="success" />

        <GroupedSection eyebrow="Listado" title="Deudas del hogar">
          {debts.length === 0 ? (
            <EmptyState icon={HandCoins} title="Todavía no hay deudas" description="Agregá la primera para seguir el saldo sin planillas." compact className="m-4" />
          ) : (
            <div>
              {debts.map((debt) => {
                const progress = Math.max(0, Math.min(100, 100 - (Number(debt.remainingBalance) / Math.max(Number(debt.originalAmount), 1)) * 100));
                return (
                  <ResourceSheet
                    key={debt.id}
                    title={debt.entityName}
                    headerAction={
                      <ConfirmForm action={deleteDebtAction} confirm={`¿Borrar la deuda “${debt.entityName}”? Esta acción no se puede deshacer.`}>
                        <input type="hidden" name="id" value={debt.id} />
                        <Button type="submit" variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="Borrar deuda">
                          <Trash2 className="size-4" aria-hidden />
                        </Button>
                      </ConfirmForm>
                    }
                    trigger={
                      <ResourceRowShell
                        icon={<HandCoins className="size-4" aria-hidden />}
                        title={debt.entityName}
                        meta={`${debt.direction === "we_owe" ? "Debemos" : "Nos deben"} · ${Math.round(progress)}% saldado`}
                        trailing={<div className="text-right"><p className="money-row">{formatArs(debt.remainingBalance)}</p><StatusPill tone={debt.isActive ? "warning" : "neutral"}>{debt.isActive ? "Activa" : "Cerrada"}</StatusPill></div>}
                      />
                    }
                  >
                    {debtForm({
                      id: debt.id,
                      prefix: `debt-${debt.id}`,
                      entityName: debt.entityName,
                      direction: debt.direction,
                      originalAmount: moneyInputValue(debt.originalAmount),
                      remainingBalance: moneyInputValue(debt.remainingBalance),
                      notes: debt.notes,
                      isActive: debt.isActive,
                    })}
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
