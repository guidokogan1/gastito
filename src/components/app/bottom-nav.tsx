"use client";

import {
  ArrowRightLeft,
  CreditCard,
  HandCoins,
  Landmark,
  LayoutDashboard,
  MoreHorizontal,
  Repeat2,
  Tags,
} from "lucide-react";

import { NavLink } from "@/components/app/nav-link";
import { Slideout } from "@/components/app/slideout";
import { cn } from "@/lib/utils";
import { useState } from "react";

const icons = {
  dashboard: LayoutDashboard,
  transactions: ArrowRightLeft,
  categories: Tags,
  paymentMethods: CreditCard,
  accounts: Landmark,
  debts: HandCoins,
  recurringBills: Repeat2,
  more: MoreHorizontal,
};

export type BottomNavLink = {
  href: string;
  label: string;
  iconKey: keyof typeof icons;
};

export function BottomNav({ links }: { links: readonly BottomNavLink[] }) {
  const visibleLinks = links.slice(0, 4);
  const overflowLinks = links.slice(4);
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav className="bottom-nav lg:hidden" aria-label="Navegación principal">
        {visibleLinks.map((link) => (
          <BottomNavItem key={link.href} link={link} />
        ))}
        <button type="button" className="bottom-nav-item" onClick={() => setMoreOpen(true)} aria-label="Abrir más secciones">
          <MoreHorizontal className="size-4" aria-hidden />
          <span>Más</span>
        </button>
      </nav>
      <Slideout open={moreOpen} title="Más secciones" description="Accedé a las áreas menos frecuentes." onClose={() => setMoreOpen(false)}>
        <div className="divide-y divide-border/60">
          {overflowLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              className="selectable-row rounded-[1rem] px-3"
              activeClassName="bg-[var(--surface-pill)] text-[var(--finance-green)]"
              onClick={() => setMoreOpen(false)}
            >
              <span className="flex min-w-0 items-center gap-3">
                {(() => {
                  const Icon = icons[link.iconKey];
                  return <Icon className="size-4 shrink-0" aria-hidden />;
                })()}
                <span className="truncate">{link.label}</span>
              </span>
            </NavLink>
          ))}
        </div>
      </Slideout>
    </>
  );
}

function BottomNavItem({ link }: { link: BottomNavLink }) {
  const Icon = icons[link.iconKey];
  const shortLabel = link.iconKey === "recurringBills" ? "Fijos" : link.label;

  return (
    <NavLink href={link.href} className={cn("bottom-nav-item")} activeClassName="bottom-nav-item-active">
      <Icon className="size-4" aria-hidden />
      <span>{shortLabel}</span>
    </NavLink>
  );
}
