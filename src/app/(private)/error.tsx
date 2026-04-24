"use client";

import { FlashMessage } from "@/components/flash-message";
import { CardContent, CardHeader } from "@/components/ui/card";
import { CardPage } from "@/components/ui/card-page";
import { Button } from "@/components/ui/button";

function isDbConnectionError(message: string) {
  return /Can't reach database server/i.test(message) || /P1001/i.test(message);
}

export default function PrivateError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const friendlyMessage = isDbConnectionError(error.message)
    ? "No pudimos conectar a la base de datos. Verificá `DATABASE_URL` y que el servidor esté accesible."
    : "No pudimos cargar esta sección. Probá reintentar en unos segundos.";

  return (
    <CardPage>
      <CardHeader className="space-y-2">
        <p className="stat-label text-primary">Error</p>
        <h2 className="section-title">No pudimos cargar esta sección</h2>
        <p className="text-sm text-muted-foreground">
          Revisá que la base, el proveedor de auth y las variables de entorno estén configuradas correctamente.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <FlashMessage message={friendlyMessage} tone="error" />
        {process.env.NODE_ENV === "development" ? (
          <details className="rounded-xl border border-border/70 bg-card/30 px-4 py-3 text-sm text-muted-foreground">
            <summary className="cursor-pointer select-none text-foreground">Detalles técnicos</summary>
            <pre className="mt-3 whitespace-pre-wrap break-words text-xs leading-relaxed">
              {error.message}
              {error.digest ? `\n\ndigest: ${error.digest}` : ""}
            </pre>
          </details>
        ) : null}
        <Button type="button" onClick={reset}>
          Reintentar
        </Button>
      </CardContent>
    </CardPage>
  );
}
