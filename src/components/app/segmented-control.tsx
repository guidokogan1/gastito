import { cn } from "@/lib/utils";

type Option = {
  value: string;
  label: string;
};

export function SegmentedControl({
  name,
  options,
  value,
  defaultValue,
  onValueChange,
  size = "md",
  className,
}: {
  name?: string;
  options: Option[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: "sm" | "md";
  className?: string;
}) {
  const selectedValue = value ?? defaultValue ?? options[0]?.value ?? "";

  return (
    <div
      className={cn("grid rounded-full bg-[var(--surface-pill)] p-1", className)}
      style={{ gridTemplateColumns: `repeat(${Math.max(options.length, 1)}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const active = option.value === selectedValue;

        return (
          <label key={option.value} className="cursor-pointer">
            {name ? (
              <input
                type="radio"
                name={name}
                value={option.value}
                defaultChecked={option.value === defaultValue}
                className="sr-only"
              />
            ) : null}
            {onValueChange ? (
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-center rounded-full text-center transition-[background,color,box-shadow] duration-150",
                  size === "sm" && "h-11 text-[0.98rem] font-semibold",
                  size === "md" && "h-12 text-[1rem] font-semibold",
                  active
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
                onClick={() => onValueChange(option.value)}
                aria-pressed={active}
              >
                {option.label}
              </button>
            ) : (
              <span
                className={cn(
                  "flex w-full items-center justify-center rounded-full text-center transition-[background,color,box-shadow] duration-150",
                  size === "sm" && "h-11 text-[0.98rem] font-semibold",
                  size === "md" && "h-12 text-[1rem] font-semibold",
                  active
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}
