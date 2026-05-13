import {
  Building2,
  CreditCard,
  LogOut,
  Tags,
  Wallet,
} from "lucide-react";

import { logoutAction } from "@/app/actions/auth";
import { MetricStrip } from "@/components/app/metric-strip";
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
  const [memberCount, categoryCount, paymentMethodCount, bankCount, accountCount] = previewDataset
    ? [
        previewDataset.memberCount,
        previewDataset.categories.length,
        previewDataset.methods.length,
        previewDataset.banks.length,
        previewDataset.accounts.length,
      ]
    : await Promise.all([
        prisma.membership.count({ where: { householdId: household.id } }),
        prisma.category.count({ where: { householdId: household.id, deletedAt: null } }),
        prisma.paymentMethod.count({ where: { householdId: household.id, deletedAt: null } }),
        prisma.bank.count({ where: { householdId: household.id, deletedAt: null } }),
        prisma.account.count({ where: { householdId: household.id, deletedAt: null } }),
      ]);

  const householdName = toTitleCase(household.name);
  const memberLabel = memberCount === 1 ? "1 miembro" : `${memberCount} miembros`;

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
            <p className="row-meta mt-0.5">Grupo familiar · {memberLabel}</p>
          </div>
        </div>
        <div className="mt-4 border-t border-border/70 pt-4">
          <MetricStrip
            columns={3}
            items={[
              { label: "Miembros", value: memberCount.toString() },
              { label: "Cuentas", value: accountCount.toString() },
              { label: "Medios", value: paymentMethodCount.toString() },
            ]}
          />
        </div>
      </section>

      {isPreviewModeAvailable() ? <PreviewModeSwitcher activePreset={previewPreset} /> : null}

      <section className="space-y-2">
        <h2 className="section-title">Configuración del hogar</h2>
        <p className="text-[0.92rem] leading-relaxed text-muted-foreground">
          Desde acá ordenás las piezas base del sistema para que cargar, filtrar y entender movimientos sea cada vez más fácil.
        </p>
      </section>

      <SettingsGroup
        label="Estructura"
        description="Define dónde vive la plata y con qué entidades o contenedores la querés organizar."
      >
        <SettingsRow href="/cuentas" icon={Wallet} title="Cuentas" subtitle={`${accountCount} cuentas para separar banco, billetera y efectivo`} />
        <SettingsRow href="/mas/bancos" icon={Building2} title="Bancos y billeteras" subtitle={`${bankCount} entidades para asociar medios`} />
      </SettingsGroup>

      <SettingsGroup
        label="Catálogos"
        description="Estas piezas mejoran cómo cargás, filtrás y entendés movimientos todos los días."
      >
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
