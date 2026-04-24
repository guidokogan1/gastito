"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Slideout({
  open,
  title,
  description,
  onClose,
  children,
  className,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Cerrar"
        className="slideout-overlay absolute inset-0 bg-black/30 backdrop-blur-[1px] motion-safe:animate-[fade-in-soft_160ms_ease-out]"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "slideout-panel motion-safe:animate-[slideout-in-right_220ms_cubic-bezier(0.2,0.8,0.2,1)]",
          "absolute right-0 top-0 h-full w-full max-w-[520px] border-l border-border/70 bg-background shadow-xl",
          "flex flex-col overflow-hidden p-5 sm:p-6",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="stat-label">{title}</p>
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar panel">
            <X className="size-4" aria-hidden />
          </Button>
        </div>
        <div className="mt-5 flex-1 overflow-y-auto pr-1">{children}</div>
      </aside>
    </div>
  );
}
