import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/", label: "Resumen" },
  { href: "/movimientos", label: "Movimientos" },
  { href: "/categorias", label: "Categorías" },
  { href: "/medios-de-pago", label: "Medios de pago" },
  { href: "/cuentas", label: "Cuentas" },
  { href: "/deudas", label: "Deudas" },
  { href: "/gastos-fijos", label: "Gastos fijos" },
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

          <nav className="grid gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "pressable rounded-xl px-3 py-2 text-sm font-medium text-sidebar-foreground/90 transition-colors hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <form action={logoutAction} className="pt-1">
            <Button type="submit" variant="secondary" className="w-full">
              Cerrar sesión
            </Button>
          </form>
        </div>
      </aside>

      <main className="mx-auto w-full max-w-6xl p-5 sm:p-6 lg:max-w-none lg:p-8">
        <div className="page-enter space-y-8">{children}</div>
      </main>
    </div>
  );
}
