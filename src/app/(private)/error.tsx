"use client";

import { FlashMessage } from "@/components/flash-message";
import { CardContent, CardHeader } from "@/components/ui/card";
import { CardPage } from "@/components/ui/card-page";
import { Button } from "@/components/ui/button";

export default function PrivateError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
        <FlashMessage message={error.message} tone="error" />
        <Button type="button" onClick={reset}>
          Reintentar
        </Button>
      </CardContent>
    </CardPage>
  );
}
