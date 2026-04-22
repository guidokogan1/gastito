import { redirect } from "next/navigation";

import { completeOnboardingAction } from "@/app/actions/resources";
import { FlashMessage } from "@/components/flash-message";
import { requireUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
    <div className="min-h-screen px-5 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-lg">
        <Card className="card-page overflow-hidden">
          <CardHeader className="space-y-2">
            <p className="stat-label text-primary">Onboarding guiado</p>
            <h1 className="page-title">Armemos tu hogar</h1>
            <p className="page-description">
              Dejamos todo listo con moneda ARS, categorías sugeridas, medios de pago comunes y cuentas iniciales.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <FlashMessage message={params.error} tone="error" />

            <div className="rounded-2xl border border-border/70 bg-card/30 p-4">
              <p className="stat-label">Tu cuenta</p>
              <p className="mt-1 text-[1.05rem] font-semibold">{current.user.email}</p>
              <p className="mt-1 text-sm text-muted-foreground">Vas a quedar como dueño principal del hogar.</p>
            </div>

            <form action={completeOnboardingAction} className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="householdName" className="text-sm font-medium">
                  Nombre del hogar
                </label>
                <Input id="householdName" name="householdName" type="text" placeholder="Ej. Familia Pérez" required />
              </div>
              <div className="rounded-2xl border border-border/70 bg-card/30 p-4">
                <p className="stat-label">Lo que se crea automáticamente</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Moneda base ARS, categorías sugeridas, medios de pago habituales y cuentas iniciales para arrancar.
                </p>
              </div>
              <Button type="submit" className="w-full">
                Crear hogar y empezar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
