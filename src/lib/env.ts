function firstPresent(names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return undefined;
}

function requiredOne(names: string[]) {
  const value = firstPresent(names);
  if (!value) {
    throw new Error(`Falta una de estas variables de entorno en Gastito: ${names.join(", ")}.`);
  }
  return value;
}

function optional(name: string) {
  return process.env[name]?.trim() || undefined;
}

function requiredUrl(names: string[]) {
  const value = requiredOne(names);
  try {
    return new URL(value).toString().replace(/\/$/, "");
  } catch {
    throw new Error(`La variable de entorno ${names.join(" o ")} debe ser una URL válida.`);
  }
}

export function getPublicAppEnv() {
  const supabaseUrl = optional("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = optional("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return {
    databaseUrl: requiredOne(["DATABASE_URL", "PUBLIC_APP_DATABASE_URL"]),
    directUrl: requiredOne(["DIRECT_DATABASE_URL", "PUBLIC_APP_DIRECT_URL"]),
    authProvider: optional("AUTH_PROVIDER") ?? "neon",
    neonAuthUrl: optional("NEON_AUTH_URL"),
    neonAuthCookieSecret: optional("NEON_AUTH_COOKIE_SECRET"),
    supabaseUrl: supabaseUrl ? new URL(supabaseUrl).toString().replace(/\/$/, "") : "",
    supabaseAnonKey: supabaseAnonKey ?? "",
    siteUrl: requiredUrl(["PUBLIC_APP_SITE_URL"]),
  };
}

export function assertPublicAppEnv() {
  return getPublicAppEnv();
}

export function getSiteHostMismatch(siteUrl: string, host: string | null | undefined) {
  if (!host) return null;

  const expectedHost = new URL(siteUrl).host;
  if (expectedHost === host) return null;

  const requestHost = host.split(":")[0];
  const isLocalDevelopmentHost =
    process.env.NODE_ENV !== "production" &&
    (requestHost === "localhost" || requestHost === "127.0.0.1");

  if (isLocalDevelopmentHost) return null;

  return {
    expectedHost,
    actualHost: host,
  };
}
