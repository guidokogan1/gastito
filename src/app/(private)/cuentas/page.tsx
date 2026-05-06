import { deleteAccountAction, saveAccountAction } from "@/app/actions/resources";
import { Landmark } from "lucide-react";
import { FlashMessage } from "@/components/flash-message";
import { ConfirmForm } from "@/components/app/confirm-form";
import { GroupedSection } from "@/components/app/grouped-section";
import { KineticPage } from "@/components/app/kinetic";
import { ScreenScaffold } from "@/components/app/screen-scaffold";
import { EmptyState } from "@/components/app/empty-state";
import { SubmitButton } from "@/components/app/submit-button";
import { CheckboxLine } from "@/components/ui/checkbox-line";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Label } from "@/components/ui/label";
import { ResourceCreateButton, ResourceRowShell, ResourceSheet } from "@/components/app/resource-sheet";
import { StatusPill } from "@/components/app/pill-chip";
import { DangerZone } from "@/components/app/danger-zone";
import { requireHousehold } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ACCOUNT_TYPES = [
  { value: "cash", label: "Efectivo" },
  { value: "bank", label: "Banco" },
  { value: "wallet", label: "Billetera" },
] as const;

const ACCOUNT_TYPE_LABEL = Object.fromEntries(
  ACCOUNT_TYPES.map((item) => [item.value, item.label] as const),
) as Record<(typeof ACCOUNT_TYPES)[number]["value"], string>;

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { household } = await requireHousehold();
  const params = await searchParams;
  const accounts = await prisma.account.findMany({
    where: { householdId: household.id, deletedAt: null },
    select: { id: true, name: true, type: true, isActive: true },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  return (
    <KineticPage>
      <ScreenScaffold
        title="Cuentas"
        description="Separá efectivo, banco y billeteras sin ruido administrativo."
        actions={
          <ResourceSheet title="Nueva cuenta" description="Agregá una cuenta para ordenar movimientos." trigger={<ResourceCreateButton />}>
            <form action={saveAccountAction} className="space-y-4">
              <section className="grouped-form-section space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" name="name" placeholder="Ej. Cuenta sueldo" required autoFocus />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="type">Tipo</Label>
                  <NativeSelect id="type" name="type" defaultValue="bank">
                    {ACCOUNT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </NativeSelect>
                </div>
                <CheckboxLine name="isActive" defaultChecked>Dejar activa</CheckboxLine>
              </section>
              <div className="sheet-action-bar">
                <SubmitButton type="submit" className="w-full" pendingText="Creando...">Crear cuenta</SubmitButton>
              </div>
            </form>
          </ResourceSheet>
        }
      >
        <FlashMessage message={params.error} tone="error" />
        <FlashMessage message={params.message} tone="success" />
        <GroupedSection eyebrow="Catálogo" title="Cuentas del hogar">
            {accounts.length === 0 ? (
              <EmptyState
                icon={Landmark}
                title="Todavía no hay cuentas"
                description="Creá la primera cuenta a la derecha."
                compact
                className="m-4"
              />
            ) : (
              <div>
                {accounts.map((account) => (
                  <ResourceSheet
                    key={account.id}
                    title={account.name}
                    description="Editar cuenta"
                    trigger={
                      <ResourceRowShell
                        icon={<Landmark className="size-4" aria-hidden />}
                        title={account.name}
                        meta={ACCOUNT_TYPE_LABEL[account.type] ?? account.type}
                        trailing={<StatusPill tone={account.isActive ? "success" : "neutral"}>{account.isActive ? "Activa" : "Inactiva"}</StatusPill>}
                      />
                    }
                  >
                    <form action={saveAccountAction} className="space-y-4">
                      <section className="grouped-form-section space-y-3">
                        <input type="hidden" name="id" value={account.id} />
                        <div className="space-y-1.5">
                          <Label htmlFor={`account-${account.id}`}>Nombre</Label>
                          <Input id={`account-${account.id}`} name="name" defaultValue={account.name} />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor={`account-type-${account.id}`}>Tipo</Label>
                        <NativeSelect
                          id={`account-type-${account.id}`}
                          name="type"
                          defaultValue={account.type}
                          aria-label={`Tipo de la cuenta ${account.name}`}
                        >
                          {ACCOUNT_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </NativeSelect>
                        </div>
                        <CheckboxLine name="isActive" defaultChecked={account.isActive}>
                          Activa
                        </CheckboxLine>
                      </section>
                      <div className="sheet-action-bar">
                        <SubmitButton type="submit" className="w-full" pendingText="Guardando...">Guardar cambios</SubmitButton>
                      </div>
                    </form>
                    <DangerZone description="Si la cuenta ya registra movimientos, conviene dejarla inactiva para no perder contexto histórico.">
                      <ConfirmForm action={deleteAccountAction} confirm={`¿Borrar la cuenta “${account.name}”? Esta acción no se puede deshacer.`}>
                        <input type="hidden" name="id" value={account.id} />
                        <SubmitButton type="submit" variant="destructive" className="w-full" pendingText="Borrando...">
                          Borrar
                        </SubmitButton>
                      </ConfirmForm>
                    </DangerZone>
                  </ResourceSheet>
                ))}
              </div>
            )}
        </GroupedSection>
      </ScreenScaffold>
    </KineticPage>
  );
}
