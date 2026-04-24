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
      ? "border-destructive/30 bg-destructive/10 text-destructive"
      : tone === "success"
        ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
        : tone === "warning"
          ? "border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-200"
          : "border-border/70 bg-accent/35 text-foreground";

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-4 py-3 text-[0.95rem] leading-relaxed motion-safe:animate-[fade-in-soft_160ms_ease-out]",
        toneClasses,
      )}
    >
      {message}
    </div>
  );
}
