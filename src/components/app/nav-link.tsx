"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function isPathActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLink({
  href,
  className,
  activeClassName,
  ...props
}: React.ComponentProps<typeof Link> & {
  activeClassName?: string;
}) {
  const pathname = usePathname();
  const isActive = isPathActive(pathname, href.toString());

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(className, isActive && activeClassName)}
      {...props}
    />
  );
}
