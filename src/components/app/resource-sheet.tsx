"use client";

import { useState } from "react";
import { ChevronRight, Plus } from "lucide-react";
import { Slot } from "radix-ui";

import { AppIconAction } from "@/components/app/icon-action";
import { Slideout } from "@/components/app/slideout";
import { cn } from "@/lib/utils";

export function ResourceSheet({
  title,
  description,
  trigger,
  triggerClassName,
  triggerAsChild = false,
  children,
  headerAction,
}: {
  title: string;
  description?: string;
  trigger: React.ReactNode;
  triggerClassName?: string;
  triggerAsChild?: boolean;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const TriggerComp = triggerAsChild ? Slot.Root : "button";

  return (
    <>
      <TriggerComp
        {...(!triggerAsChild ? { type: "button" as const } : {})}
        className={cn("block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/18", triggerClassName)}
        onClick={() => setOpen(true)}
      >
        {trigger}
      </TriggerComp>
      <Slideout open={open} title={title} description={description} headerAction={headerAction} onClose={() => setOpen(false)}>
        {children}
      </Slideout>
    </>
  );
}

export function ResourceCreateButton({ children }: { children?: React.ReactNode }) {
  return (
    <AppIconAction asChild tone="primary">
      <span>
        <Plus className="size-4" aria-hidden />
        {children ? <span className="ml-2">{children}</span> : null}
      </span>
    </AppIconAction>
  );
}

export function ResourceRowShell({
  icon,
  title,
  meta,
  trailing,
  showChevron = true,
  interactive = false,
  className,
}: {
  icon: React.ReactNode;
  title: React.ReactNode;
  meta?: React.ReactNode;
  trailing?: React.ReactNode;
  showChevron?: boolean;
  interactive?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("grouped-row", className)} data-interactive={interactive ? "true" : undefined}>
      <div className="app-icon-tile">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="row-title truncate">{title}</p>
        {meta ? <div className="row-meta mt-1">{meta}</div> : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
      {showChevron ? <ChevronRight className="size-4 shrink-0 text-muted-foreground/70" aria-hidden /> : null}
    </div>
  );
}
