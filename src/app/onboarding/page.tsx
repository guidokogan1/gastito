import { redirect } from "next/navigation";

import { completeOnboardingAction } from "@/app/actions/resources";
import { FlashMessage } from "@/components/flash-message";
import { requireUser } from "@/lib/auth";

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
    <div className="onboarding-wrap">
      <section className="onboarding-card stack">
        <div>
          <p className="eyebrow">Onboarding guiado</p>
          <h1 className="title">Armemos tu hogar</h1>
          <p className="subtitle">
            Vamos a dejar todo listo con moneda ARS, categorías sugeridas, medios de pago comunes y cuentas iniciales.
          </p>
        </div>

        <FlashMessage message={params.error} tone="error" />

        <div className="card">
          <p className="eyebrow">Tu cuenta</p>
          <strong>{current.user.email}</strong>
          <p className="muted">Vas a quedar como dueño principal del hogar.</p>
        </div>

        <form action={completeOnboardingAction} className="form-grid">
          <div className="field">
            <label htmlFor="householdName">Nombre del hogar</label>
            <input
              id="householdName"
              name="householdName"
              type="text"
              placeholder="Ej. Familia Pérez"
              required
            />
          </div>
          <div className="card">
            <p className="eyebrow">Lo que se crea automáticamente</p>
            <p className="muted">
              Moneda base ARS, categorías sugeridas, medios de pago habituales y cuentas iniciales para arrancar.
            </p>
          </div>
          <button type="submit" className="button full-width">
            Crear hogar y empezar
          </button>
        </form>
      </section>
    </div>
  );
}
