import Link from "next/link";

import { registerAction } from "@/app/actions/auth";
import { FlashMessage } from "@/components/flash-message";
import { AuthScreen } from "@/components/app/auth-screen";
import { SubmitButton } from "@/components/app/submit-button";
import { redirectIfAuthenticated } from "@/lib/auth";
import { getPublicAppEnv } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await redirectIfAuthenticated();
  const params = await searchParams;
  const { authProvider } = getPublicAppEnv();

  return (
    <AuthScreen
      eyebrow="Primer paso"
      title="Creá tu cuenta"
      description={
        <>
          Te registrás por email usando {authProvider === "supabase" ? "Supabase Auth" : "Neon Auth"} y después armás tu hogar en un minuto.
        </>
      }
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
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </label>
                <Input id="password" name="password" type="password" autoComplete="new-password" required />
              </div>
              <SubmitButton type="submit" className="w-full" pendingText="Creando...">
                Crear cuenta
              </SubmitButton>
            </form>

            <Button asChild variant="secondary" className="w-full">
              <Link href="/login">Volver al login</Link>
            </Button>
          </CardContent>
    </AuthScreen>
  );
}
