"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SearchPill({
  id,
  value,
  placeholder,
  onValueChange,
  className,
}: {
  id: string;
  value: string;
  placeholder: string;
  onValueChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("relative flex-1", className)}>
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        className="h-10.5 rounded-[1rem] border-transparent bg-[var(--surface-pill)] pl-10 text-[0.9rem] font-normal shadow-none"
      />
    </div>
  );
}
