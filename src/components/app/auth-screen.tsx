import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function AuthScreen({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  description: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className="auth-screen">
      <div className={cn("auth-panel", className)}>
        <header className="auth-header">
          <p className="stat-label text-primary">{eyebrow}</p>
          <h1 className="auth-title">{title}</h1>
          <p className="auth-description">{description}</p>
        </header>
        <Card className="auth-form-card">{children}</Card>
      </div>
    </main>
  );
}
