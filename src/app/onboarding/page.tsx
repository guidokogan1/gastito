import { redirect } from "next/navigation";

import { completeOnboardingAction } from "@/app/actions/resources";
import { FlashMessage } from "@/components/flash-message";
import { AuthScreen } from "@/components/app/auth-screen";
import { SubmitButton } from "@/components/app/submit-button";
import { requireUser } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const current = await requireUser();
  if (current.household) {
    redirect("/");
  }

  const params = await searchParams;

  return (
    <AuthScreen
      eyebrow="Onboarding guiado"
      title="Armemos tu hogar"
      description="Dejamos todo listo con moneda ARS, categorías sugeridas, medios de pago comunes y cuentas iniciales."
      className="max-w-[520px]"
    >
          <CardContent className="space-y-4 p-4 sm:p-5">
            <FlashMessage message={params.error} tone="error" />

            <div className="rounded-[1.15rem] border border-border bg-card p-4">
              <p className="stat-label">Tu cuenta</p>
              <p className="mt-1 text-[1.05rem] font-semibold">{current.user.email}</p>
              <p className="mt-1 text-sm text-muted-foreground">Vas a quedar como dueño principal del hogar.</p>
            </div>

            <form action={completeOnboardingAction} className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="householdName" className="text-sm font-medium">
                  Nombre del hogar
                </label>
                <Input
                  id="householdName"
                  name="householdName"
                  type="text"
                  placeholder="Ej. Familia Pérez"
                  required
                  autoFocus
                />
              </div>
              <div className="rounded-[1.15rem] border border-border bg-card p-4">
                <p className="stat-label">Lo que se crea automáticamente</p>
                <div className="mt-3 grid gap-2 text-sm font-medium text-muted-foreground">
                  {["Moneda base ARS", "Categorías sugeridas", "Medios de pago habituales", "Cuentas iniciales"].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <span className="grid size-5 place-items-center rounded-full bg-[var(--income-soft)] text-[var(--income)]">
                        <Check className="size-3" aria-hidden />
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <SubmitButton type="submit" className="w-full" pendingText="Creando hogar...">
                Crear hogar y empezar
              </SubmitButton>
            </form>
          </CardContent>
    </AuthScreen>
  );
}
