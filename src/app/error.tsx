"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="auth-wrap">
        <section className="auth-card">
          <p className="eyebrow">Configuración pendiente</p>
          <h1 className="title">La app no pudo arrancar bien</h1>
          <p className="subtitle">
            {error.message || "Revisá variables de entorno, conexión a Postgres y configuración de Supabase Auth."}
          </p>
          <button type="button" className="button" onClick={reset}>
            Reintentar
          </button>
        </section>
      </body>
    </html>
  );
}
