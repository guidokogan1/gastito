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
import { NavLink } from "@/components/app/nav-link";
import { SubmitButton } from "@/components/app/submit-button";

const links = [
  { href: "/", label: "Resumen", icon: LayoutDashboard },
  { href: "/movimientos", label: "Movimientos", icon: ArrowRightLeft },
  { href: "/categorias", label: "Categorías", icon: Tags },
  { href: "/medios-de-pago", label: "Medios de pago", icon: CreditCard },
  { href: "/cuentas", label: "Cuentas", icon: Landmark },
  { href: "/deudas", label: "Deudas", icon: HandCoins },
  { href: "/gastos-fijos", label: "Gastos fijos", icon: Repeat2 },
];

export function AppShell({
  householdName,
  userEmail,
  children,
}: {
  householdName: string;
  userEmail: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="border-b border-border/70 bg-sidebar/40 backdrop-blur-sm lg:border-b-0 lg:border-r">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-5 sm:p-6 lg:max-w-none lg:p-8">
          <header className="space-y-1">
            <p className="stat-label text-sidebar-primary">Hogar Finanzas</p>
            <h1 className="text-[1.15rem] font-semibold tracking-tight text-sidebar-foreground">
              {householdName}
            </h1>
            <p className="text-sm text-muted-foreground">{userEmail}</p>
          </header>

          <details className="rounded-2xl border border-border/70 bg-background/40 p-1 lg:hidden">
            <summary className="pressable cursor-pointer list-none rounded-xl px-3 py-2 text-sm font-medium text-sidebar-foreground/90 transition-colors hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
              Menú
            </summary>
            <nav className="mt-1 grid gap-1 pb-1">
              {links.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "pressable flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-sidebar-foreground/90 transition-colors hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                  )}
                  activeClassName="bg-sidebar-accent/80 text-sidebar-accent-foreground"
                >
                  <link.icon className="size-4 text-muted-foreground" aria-hidden />
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </details>

          <nav className="hidden gap-1 lg:grid">
            {links.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                className={cn(
                  "pressable flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-sidebar-foreground/90 transition-colors hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                )}
                activeClassName="bg-sidebar-accent/80 text-sidebar-accent-foreground"
              >
                <link.icon className="size-4 text-muted-foreground" aria-hidden />
                {link.label}
              </NavLink>
            ))}
          </nav>

          <form action={logoutAction} className="pt-1">
            <SubmitButton type="submit" variant="secondary" className="w-full" pendingText="Saliendo...">
              Cerrar sesión
            </SubmitButton>
          </form>
        </div>
      </aside>

      <main id="content" className="mx-auto w-full max-w-6xl p-5 sm:p-6 lg:max-w-none lg:p-8">
        <div className="page-enter space-y-8">{children}</div>
      </main>
    </div>
  );
}
