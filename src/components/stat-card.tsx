import { cn } from "@/lib/utils";
import { CardContent, CardHeader } from "@/components/ui/card";
import { CardPage } from "@/components/ui/card-page";

const variantClasses = {
  default: "text-foreground",
  positive: "text-green-600 dark:text-green-500",
  negative: "text-destructive",
  muted: "text-muted-foreground",
};

export function StatCard({
  label,
  value,
  hint,
  variant = "default",
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  variant?: keyof typeof variantClasses;
  className?: string;
}) {
  return (
    <CardPage className={cn(className)}>
      <CardHeader className="pb-1">
        <p className="stat-label">{label}</p>
      </CardHeader>
      <CardContent>
        <p className={cn("stat-value", variantClasses[variant])}>{value}</p>
        {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </CardPage>
  );
}
