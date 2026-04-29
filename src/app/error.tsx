"use client";

import { FlashMessage } from "@/components/flash-message";
import { CardContent, CardHeader } from "@/components/ui/card";
import { CardPage } from "@/components/ui/card-page";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen px-5 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-md">
        <CardPage>
          <CardHeader className="space-y-2">
            <p className="stat-label text-primary">Configuración pendiente</p>
            <h1 className="page-title">La app no pudo arrancar bien</h1>
            <p className="page-description">
              Revisá variables de entorno, conexión a Postgres y configuración del proveedor de auth.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <FlashMessage message={error.message} tone="error" />
            <Button type="button" onClick={reset} className="w-full">
              Reintentar
            </Button>
          </CardContent>
        </CardPage>
      </div>
    </main>
  );
}
