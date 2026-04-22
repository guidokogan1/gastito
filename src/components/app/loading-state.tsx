import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = "Cargando...", className }: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground", className)}>
      <Loader2 className="size-7 animate-spin" aria-hidden />
      <p className="text-[0.95rem]">{message}</p>
    </div>
  );
}

