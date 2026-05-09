"use client";

import { useEffect } from "react";
import { ArrowRightLeft, CreditCard, HandCoins, Landmark, LayoutDashboard, MoreHorizontal, Repeat2, Tags } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

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
  more: MoreHorizontal,
};

export type BottomNavLink = {
  href: string;
  label: string;
  iconKey: keyof typeof icons;
};

export function BottomNav({ links }: { links: readonly BottomNavLink[] }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const scheduler = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const prefetchRoutes = () => {
      for (const link of links) {
        if (link.href !== pathname) router.prefetch(link.href);
      }
    };

    if (scheduler.requestIdleCallback && scheduler.cancelIdleCallback) {
      const idleId = scheduler.requestIdleCallback(prefetchRoutes, { timeout: 1800 });
      return () => scheduler.cancelIdleCallback?.(idleId);
    }

    const timeoutId = globalThis.setTimeout(prefetchRoutes, 900);
    return () => globalThis.clearTimeout(timeoutId);
  }, [links, pathname, router]);

  return (
    <nav className="bottom-nav lg:hidden" aria-label="Navegación principal">
      {links.map((link) => (
        <BottomNavItem key={link.href} link={link} />
      ))}
    </nav>
  );
}

function BottomNavItem({ link }: { link: BottomNavLink }) {
  const Icon = icons[link.iconKey];
  const router = useRouter();
  const shortLabel = link.iconKey === "recurringBills" ? "Fijos" : link.label;

  return (
    <NavLink
      href={link.href}
      className={cn("bottom-nav-item")}
      activeClassName="bottom-nav-item-active"
      onClick={(event) => {
        if (
          event.defaultPrevented ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        ) {
          return;
        }

        event.preventDefault();
        router.push(link.href);
      }}
    >
      <Icon className="size-4" aria-hidden />
      <span>{shortLabel}</span>
    </NavLink>
  );
}
