import { cn } from "@/lib/utils";

export function FlashMessage({
  message,
  tone = "info",
}: {
  message?: string;
  tone?: "info" | "success" | "warning" | "error";
}) {
  if (!message) return null;

  const toneClasses =
    tone === "error"
      ? "border-destructive/20 bg-destructive/8 text-destructive"
      : tone === "success"
        ? "border-emerald-500/18 bg-emerald-500/9 text-emerald-800 dark:text-emerald-300"
        : tone === "warning"
          ? "border-amber-500/18 bg-amber-500/9 text-amber-800 dark:text-amber-200"
          : "border-border bg-[var(--surface-pill)] text-foreground";

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-[1.15rem] border px-4 py-3 text-[0.92rem] font-medium leading-relaxed motion-safe:animate-[fade-in-soft_160ms_ease-out]",
        toneClasses,
      )}
    >
      {message}
    </div>
  );
}
