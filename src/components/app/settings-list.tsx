import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function SettingsGroup({
  label,
  description,
  children,
}: {
  label: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="section-eyebrow px-0 pb-2 pt-4">{label}</h2>
      {description ? <p className="mb-2 text-[0.9rem] leading-relaxed text-muted-foreground">{description}</p> : null}
      <div>{children}</div>
    </section>
  );
}

export function SettingsRow({
  href,
  icon: Icon,
  title,
  subtitle,
  className,
}: {
  href?: string;
  icon: LucideIcon;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
}) {
  const content = (
    <div className={cn("grouped-row", className)} data-interactive={href ? "true" : undefined}>
      <div className="app-icon-tile rounded-[0.85rem]">
        <Icon className="size-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="row-title truncate">{title}</p>
        {subtitle ? <p className="row-meta mt-0.5 truncate">{subtitle}</p> : null}
      </div>
      {href ? <ChevronRight className="size-4 shrink-0 text-muted-foreground/70" aria-hidden /> : null}
    </div>
  );

  if (!href) return content;
  return (
    <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/18">
      {content}
    </Link>
  );
}
