import { updatePasswordAction } from "@/app/actions/auth";
import { FlashMessage } from "@/components/flash-message";
import { AuthScreen } from "@/components/app/auth-screen";
import { SubmitButton } from "@/components/app/submit-button";
import { requireUser } from "@/lib/auth";
import { getPublicAppEnv } from "@/lib/env";
import { CardContent } from "@/components/ui/card";
import { PasswordField } from "@/components/app/password-field";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; token?: string }>;
}) {
  const { authProvider } = getPublicAppEnv();
  if (authProvider !== "neon") {
    await requireUser();
  }
  const params = await searchParams;

  return (
    <AuthScreen
      eyebrow="Contraseña nueva"
      title="Elegí una contraseña nueva"
      description="Usá al menos 8 caracteres para que tu acceso quede bien protegido."
    >
          <CardContent className="space-y-4 p-4 sm:p-5">
            <FlashMessage message={params.error} tone="error" />

            <form action={updatePasswordAction} className="space-y-3">
              {params.token ? <input type="hidden" name="token" value={params.token} /> : null}
              <PasswordField label="Nueva contraseña" autoComplete="new-password" autoFocus />
              <SubmitButton type="submit" className="w-full" pendingText="Actualizando...">
                Actualizar contraseña
              </SubmitButton>
            </form>
          </CardContent>
    </AuthScreen>
  );
}
