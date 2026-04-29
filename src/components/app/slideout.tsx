"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Slideout({
  open,
  title,
  description,
  onClose,
  children,
  headerAction,
  className,
  titleSize = "compact",
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  className?: string;
  titleSize?: "compact" | "large" | "small";
}) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(query.matches);
    const onChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Cerrar"
            className="sheet-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn("sheet-panel flex flex-col overflow-hidden", className)}
            initial={{ opacity: 0, y: isDesktop ? 0 : "10%", x: isDesktop ? 18 : 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: isDesktop ? 0 : "9%", x: isDesktop ? 14 : 0 }}
            transition={{ type: "spring", stiffness: 680, damping: 54, mass: 0.72 }}
          >
            <div className="sheet-handle" />
            <div className="sheet-header">
              <div className="min-w-0 space-y-1">
                <p
                  className={cn(
                    titleSize === "large" && "detail-title",
                    titleSize === "compact" && "text-[1.25rem] font-semibold tracking-[-0.035em]",
                    titleSize === "small" && "text-[1.05rem] font-semibold tracking-[-0.025em]",
                  )}
                >
                  {title}
                </p>
                {description ? <p className="text-sm font-medium text-muted-foreground">{description}</p> : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {headerAction}
                <Button type="button" variant="secondary" size="icon" onClick={onClose} aria-label="Cerrar panel">
                  <X className="size-4" aria-hidden />
                </Button>
              </div>
            </div>
            <div className="sheet-scroll">{children}</div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
