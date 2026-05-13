import Link from "next/link";

import { registerAction } from "@/app/actions/auth";
import { FlashMessage } from "@/components/flash-message";
import { AuthScreen } from "@/components/app/auth-screen";
import { SubmitButton } from "@/components/app/submit-button";
import { redirectIfAuthenticated } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { PasswordField } from "@/components/app/password-field";

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await redirectIfAuthenticated();
  const params = await searchParams;

  return (
    <AuthScreen
      eyebrow="Primer paso"
      title="Creá tu cuenta"
      description={
        <>
          Te registrás con tu email y después armás tu hogar en un minuto. Más adelante podés editar categorías, medios y cuentas sin fricción.
        </>
      }
      highlights={["Solo necesitás tu email", "Después configurás tu hogar", "Todo queda editable"]}
    >
          <CardContent className="space-y-4 p-4 sm:p-5">
            <FlashMessage message={params.error} tone="error" />

            <form action={registerAction} className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input id="email" name="email" type="email" autoComplete="email" required autoFocus />
              </div>
              <PasswordField autoComplete="new-password" />
              <SubmitButton type="submit" className="w-full" pendingText="Creando...">
                Crear cuenta
              </SubmitButton>
            </form>
            <p className="text-center text-[0.84rem] leading-relaxed text-muted-foreground">
              En el siguiente paso vas a elegir el nombre del hogar y te dejamos una base lista para empezar.
            </p>

            <Button asChild variant="secondary" className="w-full">
              <Link href="/login">Volver al login</Link>
            </Button>
          </CardContent>
    </AuthScreen>
  );
}
