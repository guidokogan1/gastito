"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

let bodyLockCount = 0;
let previousBodyOverflow = "";

function getFocusableElements(container: HTMLElement | null) {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      [
        "[data-autofocus='true']",
        "[autofocus]",
        "input:not([disabled])",
        "textarea:not([disabled])",
        "select:not([disabled])",
        "button:not([disabled])",
        "a[href]",
        "[tabindex]:not([tabindex='-1'])",
      ].join(","),
    ),
  );
}

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
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    setMounted(true);
    const query = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(query.matches);
    const onChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!open) return;
    previouslyFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
      }
      if (event.key !== "Tab") return;

      const focusable = getFocusableElements(panelRef.current);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    if (bodyLockCount === 0) {
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    bodyLockCount += 1;
    window.setTimeout(() => {
      const panel = panelRef.current;
      const focusable = getFocusableElements(panel);
      if (focusable[0]) {
        focusable[0].focus();
      } else {
        panel?.focus();
      }
    }, 0);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      bodyLockCount = Math.max(0, bodyLockCount - 1);
      if (bodyLockCount === 0) {
        document.body.style.overflow = previousBodyOverflow;
      }
      previouslyFocusedRef.current?.focus();
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
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
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
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
                  id={titleId}
                  className={cn(
                    titleSize === "large" && "detail-title",
                    titleSize === "compact" && "text-[1.25rem] font-semibold tracking-[-0.035em]",
                    titleSize === "small" && "text-[1.05rem] font-semibold tracking-[-0.025em]",
                  )}
                >
                  {title}
                </p>
                {description ? <p id={descriptionId} className="text-sm font-medium text-muted-foreground">{description}</p> : null}
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
    </AnimatePresence>,
    document.body,
  );
}
