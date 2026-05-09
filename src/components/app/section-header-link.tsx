import Link from "next/link";

import { cn } from "@/lib/utils";

export function SectionHeaderLink({
  title,
  href,
  action = "Ver todo",
  className,
}: {
  title: string;
  href?: string;
  action?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <h2 className="text-[0.74rem] font-medium uppercase tracking-[0.075em] text-muted-foreground">{title}</h2>
      {href ? (
        <Link href={href} className="text-[1rem] font-medium text-[var(--finance-green)]">
          {action}
        </Link>
      ) : null}
    </div>
  );
}
