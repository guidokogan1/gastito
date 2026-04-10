"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { authSchema } from "@/lib/validators";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

export async function registerAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const parsed = authSchema.safeParse({
    email: getString(formData, "email"),
    password: getString(formData, "password"),
  });

  if (!parsed.success) {
    redirect(`/register?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "No se pudo crear la cuenta.")}`);
  }

  const email = parsed.data.email.toLowerCase();
  const origin = process.env.PUBLIC_APP_SITE_URL || "http://localhost:3000";
  const { error } = await supabase.auth.signUp({
    email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/onboarding");
}

export async function loginAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const parsed = authSchema.safeParse({
    email: getString(formData, "email"),
    password: getString(formData, "password"),
  });

  if (!parsed.success) {
    redirect(`/login?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "No se pudo iniciar sesión.")}`);
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
  });

  if (error || !data.user) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "Email o contraseña incorrectos.")}`);
  }

  const membership = await prisma.membership.findFirst({
    where: { authUserId: data.user.id },
    select: { id: true },
  });

  if (!membership) redirect("/onboarding");
  redirect("/");
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordResetAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const email = getString(formData, "email").trim().toLowerCase();
  if (!email) {
    redirect("/forgot-password?error=Ingresá un email válido.");
  }

  const origin = process.env.PUBLIC_APP_SITE_URL || "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/forgot-password?message=Te enviamos un link para cambiar la contraseña.");
}

export async function updatePasswordAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const password = getString(formData, "password");
  if (password.trim().length < 8) {
    redirect("/reset-password?error=La contraseña debe tener al menos 8 caracteres.");
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login?message=Tu contraseña ya fue actualizada.");
}
