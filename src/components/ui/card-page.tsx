import * as React from "react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function CardPage({ className, ...props }: React.ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn(
        "card-page overflow-hidden transition-shadow duration-200",
        "hover:shadow-[0_18px_56px_-44px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_18px_56px_-44px_rgba(0,0,0,0.7)]",
        className,
      )}
      {...props}
    />
  );
}
