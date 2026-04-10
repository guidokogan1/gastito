import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";

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
    <div className="shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Hogar Finanzas</p>
          <h1>{householdName}</h1>
          <p className="muted">{userEmail}</p>
        </div>

        <nav className="nav">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link">
              {link.label}
            </Link>
          ))}
        </nav>

        <form action={logoutAction}>
          <button type="submit" className="button button-secondary full-width">
            Cerrar sesión
          </button>
        </form>
      </aside>

      <main className="content">{children}</main>
    </div>
  );
}
