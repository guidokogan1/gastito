import * as React from "react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function CardPage({ className, ...props }: React.ComponentProps<typeof Card>) {
  return <Card className={cn("card-page overflow-hidden", className)} {...props} />;
}

