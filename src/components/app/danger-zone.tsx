export function DangerZone({
  title = "Zona sensible",
  description,
  children,
}: {
  title?: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5 rounded-[1.15rem] border border-destructive/20 bg-destructive/5 p-4">
      <p className="text-sm font-semibold text-destructive">{title}</p>
      {description ? <div className="mt-1 text-sm font-medium leading-relaxed text-muted-foreground">{description}</div> : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}
