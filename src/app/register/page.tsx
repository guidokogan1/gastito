import Link from "next/link";

import { registerAction } from "@/app/actions/auth";
import { FlashMessage } from "@/components/flash-message";
import { redirectIfAuthenticated } from "@/lib/auth";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await redirectIfAuthenticated();
  const params = await searchParams;

  return (
    <div className="auth-wrap">
      <section className="auth-card">
        <p className="eyebrow">Primer paso</p>
        <h1 className="title">Creá tu cuenta</h1>
        <p className="subtitle">
          Te registrás con Supabase Auth, validás tu sesión y después armás tu hogar con un onboarding simple.
        </p>

        <FlashMessage message={params.error} tone="error" />

        <form action={registerAction} className="form-grid">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input id="password" name="password" type="password" autoComplete="new-password" required />
          </div>
          <button type="submit" className="button full-width">
            Crear cuenta
          </button>
        </form>

        <div className="link-row">
          <span className="muted">¿Ya tenés cuenta?</span>
          <Link href="/login" className="button button-secondary">
            Volver al login
          </Link>
        </div>
      </section>
    </div>
  );
}
