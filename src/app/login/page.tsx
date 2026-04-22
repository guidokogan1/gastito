import Link from "next/link";

import { loginAction } from "@/app/actions/auth";
import { FlashMessage } from "@/components/flash-message";
import { redirectIfAuthenticated } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  await redirectIfAuthenticated();
  const params = await searchParams;

  return (
    <div className="min-h-screen px-5 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-md">
        <Card className="card-page overflow-hidden">
          <CardHeader className="space-y-2">
            <p className="stat-label text-primary">Hogar Finanzas</p>
            <h1 className="page-title">Entrá a tu hogar</h1>
            <p className="page-description">
              Una versión simple y compartible para manejar gastos, ingresos y organización familiar.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <FlashMessage message={params.error} tone="error" />
              <FlashMessage message={params.message} />
            </div>

            <form action={loginAction} className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input id="email" name="email" type="email" autoComplete="email" required />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </label>
                <Input id="password" name="password" type="password" autoComplete="current-password" required />
              </div>
              <Button type="submit" className="w-full">
                Iniciar sesión
              </Button>
            </form>

            <div className="flex flex-col gap-2 pt-1">
              <Button asChild variant="secondary">
                <Link href="/register">Crear cuenta</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/forgot-password">Recuperar contraseña</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
