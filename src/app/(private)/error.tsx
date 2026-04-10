"use client";

export default function PrivateError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="card">
      <p className="eyebrow">Error controlado</p>
      <h2>No pudimos cargar esta sección</h2>
      <p className="muted">
        {error.message || "Revisá que la base, Supabase Auth y las variables de entorno estén configuradas correctamente."}
      </p>
      <button type="button" className="button" onClick={reset}>
        Reintentar
      </button>
    </div>
  );
}
