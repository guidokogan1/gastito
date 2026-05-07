import { deleteAccountAction, saveAccountAction } from "@/app/actions/resources";
import { Banknote, Building2, CircleDollarSign, Landmark, PiggyBank, Trash2, Vault, Wallet, Warehouse, type LucideIcon } from "lucide-react";
import { FlashMessage } from "@/components/flash-message";
import { ConfirmForm } from "@/components/app/confirm-form";
import { GroupedSection } from "@/components/app/grouped-section";
import { KineticPage } from "@/components/app/kinetic";
import { ScreenHeader } from "@/components/app/screen-header";
import { EmptyState } from "@/components/app/empty-state";
import { SubmitButton } from "@/components/app/submit-button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Label } from "@/components/ui/label";
import { ResourceCreateButton, ResourceRowShell, ResourceSheet } from "@/components/app/resource-sheet";
import { Button } from "@/components/ui/button";
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
  const ACCOUNT_TYPE_ICON = {
    cash: Banknote,
    bank: Landmark,
    wallet: Wallet,
  } as const;
  const fallbackAccountIcons = [PiggyBank, Building2, Vault, Warehouse, CircleDollarSign];
  const usedAccountIcons = new Set<LucideIcon>();

  const createAccount = (
    <ResourceSheet title="Nueva cuenta" trigger={<ResourceCreateButton />}>
      <form action={saveAccountAction} className="space-y-4">
        <section className="grouped-form-section space-y-3">
          <input type="hidden" name="isActive" value="on" />
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
        </section>
        <div className="sheet-action-bar">
          <SubmitButton type="submit" className="w-full" pendingText="Creando...">Crear cuenta</SubmitButton>
        </div>
      </form>
    </ResourceSheet>
  );

  return (
    <KineticPage className="space-y-5">
        <ScreenHeader title="Bancos" action={createAccount} />
        <FlashMessage message={params.error} tone="error" />
        <FlashMessage message={params.message} tone="success" />
        <GroupedSection>
            {accounts.length === 0 ? (
              <EmptyState
                icon={PiggyBank}
                title="Todavía no hay cuentas"
                description="Creá la primera cuenta a la derecha."
                compact
                className="m-4"
              />
            ) : (
              <div>
                {accounts.map((account, index) => {
                  const semanticIcon = ACCOUNT_TYPE_ICON[account.type] ?? fallbackAccountIcons[index % fallbackAccountIcons.length];
                  const Icon = usedAccountIcons.has(semanticIcon)
                    ? fallbackAccountIcons.find((item) => !usedAccountIcons.has(item)) ?? semanticIcon
                    : semanticIcon;
                  usedAccountIcons.add(Icon);
                  return (
                  <ResourceSheet
                    key={account.id}
                    title={account.name}
                    headerAction={
                      <ConfirmForm action={deleteAccountAction} confirm={`¿Borrar la cuenta “${account.name}”? Esta acción no se puede deshacer.`}>
                        <input type="hidden" name="id" value={account.id} />
                        <Button type="submit" variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="Borrar cuenta">
                          <Trash2 className="size-4" aria-hidden />
                        </Button>
                      </ConfirmForm>
                    }
                    trigger={
                      <ResourceRowShell
                        icon={<Icon className="size-4" aria-hidden />}
                        title={account.name}
                        meta={ACCOUNT_TYPE_LABEL[account.type] ?? account.type}
                      />
                    }
                  >
                    <form action={saveAccountAction} className="space-y-4">
                      <section className="grouped-form-section space-y-3">
                        <input type="hidden" name="id" value={account.id} />
                        <input type="hidden" name="isActive" value="on" />
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
                      </section>
                      <div className="sheet-action-bar">
                        <SubmitButton type="submit" className="w-full" pendingText="Guardando...">Guardar cambios</SubmitButton>
                      </div>
                    </form>
                  </ResourceSheet>
                );
                })}
              </div>
            )}
        </GroupedSection>
    </KineticPage>
  );
}
