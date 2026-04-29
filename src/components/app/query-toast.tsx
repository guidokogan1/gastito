"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";

export function QueryToast({
  message,
  error,
}: {
  message?: string;
  error?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const text = error || message || "";
  const tone = error ? "error" : "success";
  const [visible, setVisible] = useState(Boolean(text));

  useEffect(() => {
    setVisible(Boolean(text));
  }, [text]);

  const cleanUrl = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("message");
    params.delete("error");
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!text) return;
    const timeout = window.setTimeout(() => {
      setVisible(false);
      router.replace(cleanUrl, { scroll: false });
    }, tone === "error" ? 5200 : 2800);

    return () => window.clearTimeout(timeout);
  }, [cleanUrl, router, text, tone]);

  if (!text) return null;

  const Icon = tone === "error" ? XCircle : CheckCircle2;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          role={tone === "error" ? "alert" : "status"}
          className="pointer-events-none fixed inset-x-0 top-[calc(0.75rem+env(safe-area-inset-top))] z-[70] flex justify-center px-4"
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <div
            className={cn(
              "pointer-events-auto flex min-h-12 w-full max-w-[25rem] items-center gap-3 rounded-full border bg-background/92 px-4 py-2.5 text-sm font-semibold shadow-[var(--shadow-nav)] backdrop-blur-2xl",
              tone === "success" && "border-emerald-500/18 text-[var(--finance-green)]",
              tone === "error" && "border-destructive/20 text-destructive",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1 truncate">{text}</span>
            <button
              type="button"
              aria-label="Cerrar aviso"
              className="pressed-scale -mr-1 grid size-7 place-items-center rounded-full text-foreground/60"
              onClick={() => {
                setVisible(false);
                router.replace(cleanUrl, { scroll: false });
              }}
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
