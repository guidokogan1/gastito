import { updatePasswordAction } from "@/app/actions/auth";
import { FlashMessage } from "@/components/flash-message";
import { requireUser } from "@/lib/auth";
import { getPublicAppEnv } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
    <div className="min-h-screen px-5 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-md">
        <Card className="card-page overflow-hidden">
          <CardHeader className="space-y-2">
            <p className="stat-label text-primary">Contraseña nueva</p>
            <h1 className="page-title">Elegí una contraseña nueva</h1>
            <p className="page-description">Usá al menos 8 caracteres para que tu acceso quede bien protegido.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <FlashMessage message={params.error} tone="error" />

            <form action={updatePasswordAction} className="space-y-3">
              {params.token ? <input type="hidden" name="token" value={params.token} /> : null}
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium">
                  Nueva contraseña
                </label>
                <Input id="password" name="password" type="password" autoComplete="new-password" required />
              </div>
              <Button type="submit" className="w-full">
                Actualizar contraseña
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
