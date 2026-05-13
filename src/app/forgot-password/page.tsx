import Link from "next/link";

import { requestPasswordResetAction } from "@/app/actions/auth";
import { FlashMessage } from "@/components/flash-message";
import { AuthScreen } from "@/components/app/auth-screen";
import { SubmitButton } from "@/components/app/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthScreen
      eyebrow="Recuperar acceso"
      title="Recuperá tu contraseña"
      description="Te mandamos un link seguro por email para elegir una contraseña nueva."
      highlights={["Link seguro", "Sin perder tus datos", "Te lleva directo a crear una nueva clave"]}
    >
          <CardContent className="space-y-4 p-4 sm:p-5">
            <div className="space-y-3">
              <FlashMessage message={params.error} tone="error" />
              <FlashMessage message={params.message} tone="success" />
            </div>

            <form action={requestPasswordResetAction} className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input id="email" name="email" type="email" autoComplete="email" required autoFocus />
              </div>
              <SubmitButton type="submit" className="w-full" pendingText="Enviando...">
                Enviar link
              </SubmitButton>
            </form>
            <p className="text-center text-[0.84rem] leading-relaxed text-muted-foreground">
              Revisá también spam o promociones si el mail tarda unos minutos en llegar.
            </p>

            <Button asChild variant="secondary" className="w-full">
              <Link href="/login">Volver al login</Link>
            </Button>
          </CardContent>
    </AuthScreen>
  );
}
