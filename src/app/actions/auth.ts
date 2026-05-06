"use server";

import { redirect } from "next/navigation";

import {
  getProviderUser,
  requestProviderPasswordReset,
  signInWithPassword,
  signOutProvider,
  signUpWithPassword,
  updateProviderPassword,
} from "@/lib/auth-provider";
import { prisma } from "@/lib/db";
import { getPublicAppEnv } from "@/lib/env";
import { logWarn } from "@/lib/logger";
import {
  assertAnonymousActionAllowed,
  recordAuditEvent,
  safeErrorMessage,
} from "@/lib/security";
import { authSchema } from "@/lib/validators";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function withMessage(path: string, key: "error" | "message", value: string) {
  return `${path}?${key}=${encodeURIComponent(value)}`;
}

async function assertAnonymousAuthActionAllowed(action: "login" | "register" | "password_reset", subject: string) {
  try {
    await assertAnonymousActionAllowed(action, subject);
  } catch (error) {
    logWarn(`auth.${action}.guard_error`, {
      message: error instanceof Error ? error.message : "unknown_error",
    });
    redirect(
      withMessage(
        action === "register" ? "/register" : action === "password_reset" ? "/forgot-password" : "/login",
        "error",
        "No pudimos validar la solicitud. Revisá la configuración del dominio de la app.",
      ),
    );
  }
}

export async function registerAction(formData: FormData) {
  await assertAnonymousAuthActionAllowed("register", getString(formData, "email").toLowerCase());
  const parsed = authSchema.safeParse({
    email: getString(formData, "email"),
    password: getString(formData, "password"),
  });

  if (!parsed.success) {
    redirect(withMessage("/register", "error", parsed.error.issues[0]?.message ?? "No se pudo crear la cuenta."));
  }

  const email = parsed.data.email.toLowerCase();
  const { error } = await signUpWithPassword(email, parsed.data.password);

  if (error) {
    logWarn("auth.register.error", { code: error.code, status: error.status, message: error.message });
    await recordAuditEvent({ action: "auth.register", result: "failure", errorCode: error.code });
    redirect(withMessage("/register", "error", safeErrorMessage(error, "No se pudo crear la cuenta.")));
  }

  await recordAuditEvent({ action: "auth.register" });
  redirect("/onboarding");
}

export async function loginAction(formData: FormData) {
  await assertAnonymousAuthActionAllowed("login", getString(formData, "email").toLowerCase());
  const parsed = authSchema.safeParse({
    email: getString(formData, "email"),
    password: getString(formData, "password"),
  });

  if (!parsed.success) {
    redirect(withMessage("/login", "error", parsed.error.issues[0]?.message ?? "No se pudo iniciar sesión."));
  }

  const { user, error } = await signInWithPassword(parsed.data.email.toLowerCase(), parsed.data.password);

  if (error || !user) {
    logWarn("auth.login.error", { code: error?.code, status: error?.status, message: error?.message });
    await recordAuditEvent({ action: "auth.login", result: "failure", errorCode: error?.code });
    redirect(withMessage("/login", "error", "Email o contraseña incorrectos. Si la cuenta ya existe, usá Recuperar contraseña."));
  }

  const membership = await prisma.membership.findFirst({
    where: { authUserId: user.id },
    select: { id: true },
  });

  if (!membership) redirect("/onboarding");
  await recordAuditEvent({ userId: user.id, action: "auth.login" });
  redirect("/");
}

export async function logoutAction() {
  const user = await getProviderUser();
  await signOutProvider();
  await recordAuditEvent({ userId: user?.id, action: "auth.logout" });
  redirect("/login");
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = getString(formData, "email").trim().toLowerCase();
  await assertAnonymousAuthActionAllowed("password_reset", email);
  if (!email) {
    redirect(withMessage("/forgot-password", "error", "Ingresá un email válido."));
  }

  const { authProvider, siteUrl } = getPublicAppEnv();
  const redirectTo =
    authProvider === "neon"
      ? `${siteUrl}/reset-password`
      : `${siteUrl}/auth/callback?next=/reset-password`;
  const { error } = await requestProviderPasswordReset(email, redirectTo);

  if (error) {
    logWarn("auth.reset.error", { code: error.code, status: error.status, message: error.message });
    await recordAuditEvent({ action: "auth.password_reset_requested", result: "failure", errorCode: error.code });
    redirect(withMessage("/forgot-password", "error", "No pudimos enviar el email de recuperación."));
  }

  await recordAuditEvent({ action: "auth.password_reset_requested" });
  redirect(withMessage("/forgot-password", "message", "Te enviamos un link para cambiar la contraseña."));
}

export async function updatePasswordAction(formData: FormData) {
  const user = await getProviderUser();
  const password = getString(formData, "password");
  const token = getString(formData, "token").trim() || undefined;
  if (password.trim().length < 8) {
    redirect(withMessage("/reset-password", "error", "La contraseña debe tener al menos 8 caracteres."));
  }

  const { error } = await updateProviderPassword(password, token);
  if (error) {
    logWarn("auth.password_update.error", { code: error.code, status: error.status, message: error.message });
    await recordAuditEvent({ userId: user?.id, action: "auth.password_updated", result: "failure", errorCode: error.code });
    redirect(withMessage("/reset-password", "error", "No pudimos actualizar la contraseña."));
  }

  await recordAuditEvent({ userId: user?.id, action: "auth.password_updated" });
  redirect(withMessage("/login", "message", "Tu contraseña ya fue actualizada."));
}
