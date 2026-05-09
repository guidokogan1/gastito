"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SearchPill({
  id,
  open,
  value,
  placeholder,
  onOpen,
  onValueChange,
  className,
}: {
  id: string;
  open: boolean;
  value: string;
  placeholder: string;
  onOpen: () => void;
  onValueChange: (value: string) => void;
  className?: string;
}) {
  if (open) {
    return (
      <div className={cn("relative flex-1", className)}>
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          id={id}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder={placeholder}
          className="h-10 rounded-[0.95rem] pl-10 text-[0.9rem]"
          autoFocus
        />
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="secondary"
      className={cn("h-10 w-full justify-start rounded-[0.95rem] text-[0.9rem] font-normal", className)}
      onClick={onOpen}
    >
      <Search className="size-4.5 text-muted-foreground" aria-hidden />
      {placeholder}
    </Button>
  );
}
