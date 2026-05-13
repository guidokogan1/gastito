"use client";

import { usePathname, useSearchParams } from "next/navigation";

import { setPreviewModeAction } from "@/app/actions/preview";
import { cn } from "@/lib/utils";
import type { PreviewPreset } from "@/lib/preview-mode";

const options: Array<{ value: PreviewPreset | "off"; label: string }> = [
  { value: "off", label: "Real" },
  { value: "empty", label: "Vacío" },
  { value: "lite", label: "Lite" },
  { value: "full", label: "Full" },
];

export function PreviewModeSwitcher({
  activePreset,
}: {
  activePreset: PreviewPreset | null;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const redirectTo = (() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("message");
    params.delete("error");
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  })();

  return (
    <section className="rounded-[1.2rem] border border-border/80 bg-white/80 px-4 py-4">
      <div className="space-y-1">
        <h2 className="row-title text-[1rem]">Preview data</h2>
        <p className="row-meta">
          Cambiá entre vacío, poco y full sin tocar tus datos reales.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.value === "off" ? activePreset === null : activePreset === option.value;
          return (
            <form key={option.value} action={setPreviewModeAction}>
              <input type="hidden" name="preset" value={option.value} />
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <button
                type="submit"
                className={cn(
                  "pressable rounded-full px-4 py-2 text-[0.93rem] font-medium transition-colors",
                  active
                    ? "bg-[var(--finance-green)] text-white"
                    : "bg-[var(--surface-pill)] text-foreground",
                )}
              >
                {option.label}
              </button>
            </form>
          );
        })}
      </div>
    </section>
  );
}
