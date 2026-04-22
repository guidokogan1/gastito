import { cn } from "@/lib/utils";

export function CrudLayout({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("crud-grid", className)} {...props} />;
}

