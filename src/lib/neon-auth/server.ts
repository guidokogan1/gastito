import "server-only";

import { createNeonAuth } from "@neondatabase/neon-js/auth/next/server";

import { getPublicAppEnv } from "@/lib/env";

export function getNeonAuth() {
  const { neonAuthUrl, neonAuthCookieSecret } = getPublicAppEnv();
  if (!neonAuthUrl || !neonAuthCookieSecret) {
    throw new Error("Neon Auth no está configurado. Faltan NEON_AUTH_URL o NEON_AUTH_COOKIE_SECRET.");
  }

  return createNeonAuth({
    baseUrl: neonAuthUrl,
    cookies: {
      secret: neonAuthCookieSecret,
      sessionDataTtl: 300,
    },
  });
}
