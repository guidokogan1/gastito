import {
  Building2,
  CreditCard,
  LogOut,
  Tags,
  Wallet,
} from "lucide-react";

import { logoutAction } from "@/app/actions/auth";
import { PreviewModeSwitcher } from "@/components/app/preview-mode-switcher";
import { SettingsGroup, SettingsRow } from "@/components/app/settings-list";
import { FlashMessage } from "@/components/flash-message";
import { KineticPage } from "@/components/app/kinetic";
import { ScreenHeader } from "@/components/app/screen-header";
import { SubmitButton } from "@/components/app/submit-button";
import { requireHousehold } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPreviewDataset } from "@/lib/preview-data";
import { getPreviewPreset, isPreviewModeAvailable } from "@/lib/preview-mode";
import { toTitleCase } from "@/lib/text";

function initials(name: string) {
  const parts = toTitleCase(name).split(" ").filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

export default async function MorePage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const { household } = await requireHousehold();
  const params = await searchParams;
  const previewPreset = await getPreviewPreset();
  const previewDataset = previewPreset ? getPreviewDataset(previewPreset) : null;
  const [categoryCount, paymentMethodCount, bankCount, accountCount] = previewDataset
    ? [
        previewDataset.categories.length,
        previewDataset.methods.length,
        previewDataset.banks.length,
        previewDataset.accounts.length,
      ]
    : await Promise.all([
        prisma.category.count({ where: { householdId: household.id, deletedAt: null } }),
        prisma.paymentMethod.count({ where: { householdId: household.id, deletedAt: null } }),
        prisma.bank.count({ where: { householdId: household.id, deletedAt: null } }),
        prisma.account.count({ where: { householdId: household.id, deletedAt: null } }),
      ]);

  const householdName = toTitleCase(household.name);
  return (
    <KineticPage className="space-y-6">
      <ScreenHeader title="Más" />
      <FlashMessage message={params.error} tone="error" />
      <FlashMessage message={params.message} tone="success" />

      <section className="rounded-[1.2rem] border border-border/80 px-4 py-4">
        <div className="flex items-center gap-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-[1.05rem] bg-[var(--finance-green)] text-[1.25rem] font-bold text-white">
            {initials(householdName)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="row-title truncate text-[1.25rem]">{householdName}</h2>
            <p className="row-meta mt-0.5">Grupo familiar</p>
          </div>
        </div>
        <div className="mt-4 border-t border-border/70 pt-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="stat-label">Cuentas</p>
              <p className="stat-value mt-1 text-[1.45rem]">{accountCount}</p>
            </div>
            <div>
              <p className="stat-label">Medios</p>
              <p className="stat-value mt-1 text-[1.45rem]">{paymentMethodCount}</p>
            </div>
          </div>
        </div>
      </section>

      {isPreviewModeAvailable() ? <PreviewModeSwitcher activePreset={previewPreset} /> : null}

      <SettingsGroup label="Estructura">
        <SettingsRow href="/cuentas" icon={Wallet} title="Cuentas" subtitle={`${accountCount} cuentas`} />
        <SettingsRow href="/mas/bancos" icon={Building2} title="Bancos y billeteras" subtitle={`${bankCount} entidades`} />
      </SettingsGroup>

      <SettingsGroup label="Catálogos">
        <SettingsRow href="/mas/categorias" icon={Tags} title="Categorías" subtitle={`${categoryCount} categorías`} />
        <SettingsRow href="/mas/medios" icon={CreditCard} title="Medios de pago" subtitle={`${paymentMethodCount} medios`} />
      </SettingsGroup>

      <form action={logoutAction}>
        <div className="grouped-row">
          <div className="app-icon-tile rounded-[0.85rem]">
            <LogOut className="size-4" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="row-title truncate">Cerrar sesión</p>
          </div>
          <SubmitButton type="submit" variant="ghost" className="h-10 px-3 text-sm" pendingText="Saliendo...">
            Salir
          </SubmitButton>
        </div>
      </form>
    </KineticPage>
  );
}
