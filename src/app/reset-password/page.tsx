import { updatePasswordAction } from "@/app/actions/auth";
import { FlashMessage } from "@/components/flash-message";
import { requireUser } from "@/lib/auth";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireUser();
  const params = await searchParams;

  return (
    <div className="auth-wrap">
      <section className="auth-card">
        <p className="eyebrow">Contraseña nueva</p>
        <h1 className="title">Elegí una contraseña nueva</h1>
        <p className="subtitle">Usá al menos 8 caracteres para que tu acceso quede bien protegido.</p>

        <FlashMessage message={params.error} tone="error" />

        <form action={updatePasswordAction} className="form-grid">
          <div className="field">
            <label htmlFor="password">Nueva contraseña</label>
            <input id="password" name="password" type="password" autoComplete="new-password" required />
          </div>
          <button type="submit" className="button full-width">
            Actualizar contraseña
          </button>
        </form>
      </section>
    </div>
  );
}
