import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { getPublicAppEnv } from "@/lib/env";

export async function updateSession(request: NextRequest) {
  const { authProvider, supabaseUrl, supabaseAnonKey } = getPublicAppEnv();
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);
  let response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  if (authProvider !== "supabase" || !supabaseUrl || !supabaseAnonKey) {
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("x-request-id", requestId);
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request: { headers: requestHeaders },
        });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  await supabase.auth.getUser();
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("x-request-id", requestId);
  return response;
}
