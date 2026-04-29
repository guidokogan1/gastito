import { cn } from "@/lib/utils";

export function ScreenScaffold({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      <header className="flex items-start justify-between gap-4 pt-1">
        <div className="min-w-0">
          {eyebrow ? <p className="section-eyebrow mb-2">{eyebrow}</p> : null}
          <h1 className="screen-title">{title}</h1>
          {description ? <p className="page-description">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </header>
      {children}
    </div>
  );
}
