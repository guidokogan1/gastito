import Link from "next/link";

import { loginAction } from "@/app/actions/auth";
import { FlashMessage } from "@/components/flash-message";
import { AuthScreen } from "@/components/app/auth-screen";
import { SubmitButton } from "@/components/app/submit-button";
import { redirectIfAuthenticated } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { PasswordField } from "@/components/app/password-field";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  await redirectIfAuthenticated();
  const params = await searchParams;

  return (
    <AuthScreen
      eyebrow="Gastito"
      title="Entrá a tu hogar"
      description="Una forma calma y compartible de mirar gastos, ingresos y organización familiar."
      highlights={["Tus datos quedan en tu hogar", "Cargás en segundos", "Podés compartirlo con tu familia"]}
    >
          <CardContent className="space-y-4 p-4 sm:p-5">
            <div className="space-y-3">
              <FlashMessage message={params.error} tone="error" />
              <FlashMessage message={params.message} />
            </div>

            <form action={loginAction} className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input id="email" name="email" type="email" autoComplete="email" required autoFocus />
              </div>
              <PasswordField autoComplete="current-password" showRules={false} />
              <SubmitButton type="submit" className="w-full" pendingText="Ingresando...">
                Iniciar sesión
              </SubmitButton>
            </form>
            <p className="text-center text-[0.84rem] leading-relaxed text-muted-foreground">
              Si ya tenés un hogar creado, entrás directo. Si no, después te guiamos para dejarlo listo.
            </p>

            <div className="flex flex-col gap-2 pt-1">
              <Button asChild variant="secondary">
                <Link href="/register">Crear cuenta</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/forgot-password">Recuperar contraseña</Link>
              </Button>
            </div>
          </CardContent>
    </AuthScreen>
  );
}
