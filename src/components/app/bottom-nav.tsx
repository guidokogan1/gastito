"use client";

import {
  ArrowRightLeft,
  CreditCard,
  HandCoins,
  Landmark,
  LayoutDashboard,
  Repeat2,
  Tags,
} from "lucide-react";

import { NavLink } from "@/components/app/nav-link";
import { cn } from "@/lib/utils";

const icons = {
  dashboard: LayoutDashboard,
  transactions: ArrowRightLeft,
  categories: Tags,
  paymentMethods: CreditCard,
  accounts: Landmark,
  debts: HandCoins,
  recurringBills: Repeat2,
};

export type BottomNavLink = {
  href: string;
  label: string;
  iconKey: keyof typeof icons;
};

export function BottomNav({ links }: { links: readonly BottomNavLink[] }) {
  const visibleLinks = links.slice(0, 5);

  return (
    <nav className="bottom-nav lg:hidden" aria-label="Navegación principal">
      {visibleLinks.map((link) => (
        <BottomNavItem key={link.href} link={link} />
      ))}
    </nav>
  );
}

function BottomNavItem({ link }: { link: BottomNavLink }) {
  const Icon = icons[link.iconKey];
  const shortLabel = link.iconKey === "paymentMethods" ? "Medios" : link.label;

  return (
    <NavLink href={link.href} className={cn("bottom-nav-item")} activeClassName="bottom-nav-item-active">
      <Icon className="size-4" aria-hidden />
      <span>{shortLabel}</span>
    </NavLink>
  );
}
