export function ScreenHeader({
  title,
  action,
}: {
  title: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-4 pt-1">
      <h1 className="screen-title min-w-0 truncate">{title}</h1>
      {action ? <div className="shrink-0 pt-1">{action}</div> : null}
    </header>
  );
}
