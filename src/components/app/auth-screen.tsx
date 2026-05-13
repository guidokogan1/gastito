import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function AuthScreen({
  eyebrow,
  title,
  description,
  highlights,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  description: React.ReactNode;
  highlights?: string[];
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
          {highlights?.length ? (
            <div className="auth-highlights">
              {highlights.map((item) => (
                <span key={item} className="auth-highlight-pill">
                  {item}
                </span>
              ))}
            </div>
          ) : null}
        </header>
        <Card className="auth-form-card">{children}</Card>
      </div>
    </main>
  );
}
