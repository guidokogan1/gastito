"use client";

import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

function iconActionVariants(tone: "default" | "primary" | "danger", size: "sm" | "md") {
  return cn(
    "icon-action",
    size === "sm" ? "size-10" : "size-11",
    tone === "default" && "text-muted-foreground",
    tone === "primary" && "bg-[var(--finance-green)] text-white hover:bg-[var(--finance-green)]/94",
    tone === "danger" && "text-destructive hover:text-destructive",
  );
}

export function AppIconAction({
  asChild = false,
  tone = "default",
  size = "md",
  className,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & {
  asChild?: boolean;
  tone?: "default" | "primary" | "danger";
  size?: "sm" | "md";
}) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      {...(!asChild ? { type: "button" as const } : {})}
      className={cn(iconActionVariants(tone, size), className)}
      {...props}
    />
  );
}
