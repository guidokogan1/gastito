import {
  Bell,
  ChevronRight,
  CreditCard,
  Download,
  Eye,
  Landmark,
  LogOut,
  ShieldCheck,
  Tags,
} from "lucide-react";

import { logoutAction } from "@/app/actions/auth";
import { SettingsGroup, SettingsRow } from "@/components/app/settings-list";
import { KineticPage } from "@/components/app/kinetic";
import { ScreenHeader } from "@/components/app/screen-header";
import { SubmitButton } from "@/components/app/submit-button";
import { requireHousehold } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toTitleCase } from "@/lib/text";

function initials(name: string) {
  const parts = toTitleCase(name).split(" ").filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

export default async function MorePage() {
  const { household } = await requireHousehold();
  const [memberCount, categoryCount, paymentMethodCount, bankCount] = await Promise.all([
    prisma.membership.count({ where: { householdId: household.id } }),
    prisma.category.count({ where: { householdId: household.id, deletedAt: null } }),
    prisma.paymentMethod.count({ where: { householdId: household.id, deletedAt: null } }),
    prisma.bank.count({ where: { householdId: household.id, deletedAt: null } }),
  ]);

  const householdName = toTitleCase(household.name);
  const memberLabel = memberCount === 1 ? "1 miembro" : `${memberCount} miembros`;

  return (
    <KineticPage className="space-y-6">
      <ScreenHeader title="Más" />

      <section className="rounded-[1.2rem] border border-border/80 px-4 py-4">
        <div className="flex items-center gap-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-[1.05rem] bg-[var(--finance-green)] text-[1.25rem] font-bold text-white">
            {initials(householdName)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="row-title truncate text-[1.25rem]">{householdName}</h2>
            <p className="row-meta mt-0.5">Grupo familiar · {memberLabel}</p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-muted-foreground/70" aria-hidden />
        </div>
      </section>

      <SettingsGroup label="Catálogos">
        <SettingsRow href="/mas/categorias" icon={Tags} title="Categorías" subtitle={`${categoryCount} categorías`} />
        <SettingsRow href="/mas/medios" icon={CreditCard} title="Medios de pago" subtitle={`${paymentMethodCount} medios`} />
        <SettingsRow href="/mas/bancos" icon={Landmark} title="Bancos y billeteras" subtitle={`${bankCount} bancos`} />
      </SettingsGroup>

      <SettingsGroup label="Preferencias">
        <SettingsRow icon={Bell} title="Notificaciones" subtitle="Recordatorios de vencimientos" />
        <SettingsRow icon={Eye} title="Privacidad y datos" />
        <SettingsRow icon={Download} title="Exportar datos" subtitle="CSV · PDF" />
      </SettingsGroup>

      <SettingsGroup label="Sobre">
        <SettingsRow icon={ShieldCheck} title="Gastito" subtitle="Finanzas del hogar" />
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
      </SettingsGroup>
    </KineticPage>
  );
}
