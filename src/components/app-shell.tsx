import {
  ArrowRightLeft,
  CreditCard,
  HandCoins,
  Landmark,
  LayoutDashboard,
  Repeat2,
  Tags,
} from "lucide-react";

import { logoutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import { BottomNav } from "@/components/app/bottom-nav";
import { NavLink } from "@/components/app/nav-link";
import { SubmitButton } from "@/components/app/submit-button";
import { toTitleCase } from "@/lib/text";

const links = [
  { href: "/", label: "Resumen", icon: LayoutDashboard, iconKey: "dashboard" },
  { href: "/movimientos", label: "Movimientos", icon: ArrowRightLeft, iconKey: "transactions" },
  { href: "/categorias", label: "Categorías", icon: Tags, iconKey: "categories" },
  { href: "/medios-de-pago", label: "Medios de pago", icon: CreditCard, iconKey: "paymentMethods" },
  { href: "/cuentas", label: "Cuentas", icon: Landmark, iconKey: "accounts" },
  { href: "/deudas", label: "Deudas", icon: HandCoins, iconKey: "debts" },
  { href: "/gastos-fijos", label: "Gastos fijos", icon: Repeat2, iconKey: "recurringBills" },
] as const;

const bottomNavLinks = [
  { href: "/", label: "Resumen", iconKey: "dashboard" },
  { href: "/movimientos", label: "Movimientos", iconKey: "transactions" },
  { href: "/gastos-fijos", label: "Gastos fijos", iconKey: "recurringBills" },
  { href: "/deudas", label: "Deudas", iconKey: "debts" },
  { href: "/categorias", label: "Categorías", iconKey: "categories" },
  { href: "/medios-de-pago", label: "Medios de pago", iconKey: "paymentMethods" },
  { href: "/cuentas", label: "Bancos", iconKey: "accounts" },
] as const;

export function AppShell({
  householdName,
  userEmail,
  children,
}: {
  householdName: string;
  userEmail: string;
  children: React.ReactNode;
}) {
  const initials = householdName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const displayHouseholdName = toTitleCase(householdName);

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-sidebar-inner">
          <header className="app-brand-card">
            <div className="flex items-center gap-3">
              <div className="app-avatar">{initials || "G"}</div>
              <div className="min-w-0">
                <p className="stat-label text-sidebar-primary">Gastito</p>
                <h1 className="truncate text-[1.05rem] font-semibold tracking-[-0.03em] text-sidebar-foreground">
                  {displayHouseholdName}
                </h1>
              </div>
            </div>
            <p className="mt-3 truncate text-sm font-medium text-muted-foreground">{userEmail}</p>
          </header>

          <nav className="grid gap-1">
            {links.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                className={cn("side-nav-link")}
                activeClassName="side-nav-link-active"
              >
                <link.icon className="size-4" aria-hidden />
                {link.label}
              </NavLink>
            ))}
          </nav>

          <form action={logoutAction} className="mt-auto">
            <SubmitButton type="submit" variant="secondary" className="w-full" pendingText="Saliendo...">
              Cerrar sesión
            </SubmitButton>
          </form>
        </div>
      </aside>

      <main id="content" className="app-main">
        <div className="page-enter">{children}</div>
      </main>
      <BottomNav links={bottomNavLinks} />
    </div>
  );
}
