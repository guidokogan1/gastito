import { cn } from "@/lib/utils";

export function FlashMessage({
  message,
  tone = "info",
}: {
  message?: string;
  tone?: "info" | "error";
}) {
  if (!message) return null;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-4 py-3 text-[0.95rem] leading-relaxed",
        tone === "error"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-border/70 bg-accent/35 text-foreground",
      )}
    >
      {message}
    </div>
  );
}
