import "server-only";

import { getPublicAppEnv } from "@/lib/env";
import { getNeonAuth } from "@/lib/neon-auth/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthUser = {
  id: string;
  email: string;
};

export type AuthResult = {
  user?: AuthUser;
  error?: { code?: string; status?: number; message?: string };
};

function shouldUseNeonAuth() {
  const env = getPublicAppEnv();
  return env.authProvider === "neon" && Boolean(env.neonAuthUrl);
}

function mapUser(user: { id: string; email?: string | null } | null | undefined): AuthUser | undefined {
  if (!user?.email) return undefined;
  return { id: user.id, email: user.email };
}

function mapNeonError(error: unknown): AuthResult["error"] {
  if (!error || typeof error !== "object") return undefined;
  const candidate = error as { code?: string; status?: number; message?: string; statusText?: string };
  return {
    code: candidate.code,
    status: candidate.status,
    message: candidate.message ?? candidate.statusText,
  };
}

function mapNeonSession(data: unknown): AuthUser | undefined {
  const session = data as { user?: { id?: string; email?: string | null } } | null | undefined;
  const user = session?.user;
  if (!user?.id || !user.email) return undefined;
  return { id: user.id, email: user.email };
}

export async function getProviderUser(): Promise<AuthUser | null> {
  if (shouldUseNeonAuth()) {
    const auth = getNeonAuth();
    const { data } = await auth.getSession();
    return mapNeonSession(data) ?? null;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return mapUser(data.user) ?? null;
}

export async function signUpWithPassword(email: string, password: string): Promise<AuthResult> {
  if (shouldUseNeonAuth()) {
    const auth = getNeonAuth();
    const { data, error } = await auth.signUp.email({ email, password, name: email });
    return { user: mapNeonSession(data), error: mapNeonError(error) };
  }

  const { siteUrl } = getPublicAppEnv();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${siteUrl}/auth/callback` },
  });
  return { user: mapUser(data.user), error: error ? { code: error.code, status: error.status, message: error.message } : undefined };
}

export async function signInWithPassword(email: string, password: string): Promise<AuthResult> {
  if (shouldUseNeonAuth()) {
    const auth = getNeonAuth();
    const { data, error } = await auth.signIn.email({ email, password });
    return { user: mapNeonSession(data), error: mapNeonError(error) };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { user: mapUser(data.user), error: error ? { code: error.code, status: error.status, message: error.message } : undefined };
}

export async function signOutProvider() {
  if (shouldUseNeonAuth()) {
    const auth = getNeonAuth();
    return auth.signOut();
  }

  const supabase = await createSupabaseServerClient();
  return supabase.auth.signOut();
}

export async function requestProviderPasswordReset(email: string, redirectTo: string): Promise<AuthResult> {
  if (shouldUseNeonAuth()) {
    const auth = getNeonAuth();
    const { error } = await auth.requestPasswordReset({ email, redirectTo });
    return { error: mapNeonError(error) };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  return { error: error ? { code: error.code, status: error.status, message: error.message } : undefined };
}

export async function updateProviderPassword(password: string, token?: string): Promise<AuthResult> {
  if (shouldUseNeonAuth()) {
    const auth = getNeonAuth();
    const { error } = await auth.resetPassword({ newPassword: password, token });
    return { error: mapNeonError(error) };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.updateUser({ password });
  return { user: mapUser(data.user), error: error ? { code: error.code, status: error.status, message: error.message } : undefined };
}
