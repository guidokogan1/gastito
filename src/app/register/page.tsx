import Link from "next/link";

import { registerAction } from "@/app/actions/auth";
import { FlashMessage } from "@/components/flash-message";
import { SubmitButton } from "@/components/app/submit-button";
import { redirectIfAuthenticated } from "@/lib/auth";
import { getPublicAppEnv } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
    <div className="min-h-screen px-5 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-md">
        <Card className="card-page overflow-hidden">
          <CardHeader className="space-y-2">
            <p className="stat-label text-primary">Primer paso</p>
            <h1 className="page-title">Creá tu cuenta</h1>
            <p className="page-description">
              Te registrás por email usando {authProvider === "supabase" ? "Supabase Auth" : "Neon Auth"} y después armás tu hogar con un onboarding simple.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
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
        </Card>
      </div>
    </div>
  );
}
