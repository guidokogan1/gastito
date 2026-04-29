"use client";

import { useState } from "react";
import { ChevronRight, Plus } from "lucide-react";

import { Slideout } from "@/components/app/slideout";
import { cn } from "@/lib/utils";

export function ResourceSheet({
  title,
  description,
  trigger,
  triggerClassName,
  children,
}: {
  title: string;
  description?: string;
  trigger: React.ReactNode;
  triggerClassName?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={cn("block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/18", triggerClassName)}
        onClick={() => setOpen(true)}
      >
        {trigger}
      </button>
      <Slideout open={open} title={title} description={description} onClose={() => setOpen(false)}>
        {children}
      </Slideout>
    </>
  );
}

export function ResourceCreateButton({ children }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground">
      <Plus className="size-4" aria-hidden />
      {children ?? "Nuevo"}
    </span>
  );
}

export function ResourceRowShell({
  icon,
  title,
  meta,
  trailing,
}: {
  icon: React.ReactNode;
  title: React.ReactNode;
  meta?: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="grouped-row">
      <div className="app-icon-tile">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="row-title truncate">{title}</p>
        {meta ? <p className="row-meta mt-0.5 truncate">{meta}</p> : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
      <ChevronRight className="size-4 shrink-0 text-muted-foreground/70" aria-hidden />
    </div>
  );
}
