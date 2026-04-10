import Link from "next/link";

import { loginAction } from "@/app/actions/auth";
import { FlashMessage } from "@/components/flash-message";
import { redirectIfAuthenticated } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  await redirectIfAuthenticated();
  const params = await searchParams;

  return (
    <div className="auth-wrap">
      <section className="auth-card">
        <p className="eyebrow">Hogar Finanzas</p>
        <h1 className="title">Entrá a tu hogar</h1>
        <p className="subtitle">
          Una versión simple y compartible para manejar gastos, ingresos y organización familiar.
        </p>

        <FlashMessage message={params.error} tone="error" />
        <FlashMessage message={params.message} />

        <form action={loginAction} className="form-grid">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          <button type="submit" className="button full-width">
            Iniciar sesión
          </button>
        </form>

        <div className="link-row">
          <span className="muted">¿Todavía no tenés cuenta?</span>
          <Link href="/register" className="button button-secondary">
            Crear cuenta
          </Link>
        </div>
        <div className="link-row">
          <span className="muted">¿Olvidaste tu contraseña?</span>
          <Link href="/forgot-password" className="button button-ghost">
            Recuperarla
          </Link>
        </div>
      </section>
    </div>
  );
}
