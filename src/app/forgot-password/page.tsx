import Link from "next/link";

import { requestPasswordResetAction } from "@/app/actions/auth";
import { FlashMessage } from "@/components/flash-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen px-5 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-md">
        <Card className="card-page overflow-hidden">
          <CardHeader className="space-y-2">
            <p className="stat-label text-primary">Recuperar acceso</p>
            <h1 className="page-title">Recuperá tu contraseña</h1>
            <p className="page-description">Te mandamos un link seguro por email para elegir una contraseña nueva.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <FlashMessage message={params.error} tone="error" />
              <FlashMessage message={params.message} />
            </div>

            <form action={requestPasswordResetAction} className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input id="email" name="email" type="email" autoComplete="email" required />
              </div>
              <Button type="submit" className="w-full">
                Enviar link
              </Button>
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
