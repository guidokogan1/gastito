import Link from "next/link";

import { requestPasswordResetAction } from "@/app/actions/auth";
import { FlashMessage } from "@/components/flash-message";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="auth-wrap">
      <section className="auth-card">
        <p className="eyebrow">Recuperar acceso</p>
        <h1 className="title">Recuperá tu contraseña</h1>
        <p className="subtitle">Te mandamos un link seguro por email para elegir una contraseña nueva.</p>

        <FlashMessage message={params.error} tone="error" />
        <FlashMessage message={params.message} />

        <form action={requestPasswordResetAction} className="form-grid">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <button type="submit" className="button full-width">
            Enviar link
          </button>
        </form>

        <div className="link-row">
          <span className="muted">¿Te acordaste la contraseña?</span>
          <Link href="/login" className="button button-secondary">
            Volver al login
          </Link>
        </div>
      </section>
    </div>
  );
}
