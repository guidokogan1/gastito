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
      <header className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? <p className="section-eyebrow mb-2">{eyebrow}</p> : null}
          <h1 className="screen-title">{title}</h1>
          {description ? <p className="page-description">{description}</p> : null}
        </div>
        {actions ? <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto sm:shrink-0">{actions}</div> : null}
      </header>
      {children}
    </div>
  );
}
