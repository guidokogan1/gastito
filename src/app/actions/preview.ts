"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  PREVIEW_MODE_COOKIE,
  isPreviewModeAvailable,
  isPreviewPreset,
} from "@/lib/preview-mode";

function normalizeRedirectTarget(value: string) {
  return value.startsWith("/") ? value : "/mas";
}

export async function setPreviewModeAction(formData: FormData) {
  const redirectTo = normalizeRedirectTarget(String(formData.get("redirectTo") ?? "/mas"));
  if (!isPreviewModeAvailable()) redirect(redirectTo);

  const preset = String(formData.get("preset") ?? "off");
  const cookieStore = await cookies();

  if (preset === "off") {
    cookieStore.delete(PREVIEW_MODE_COOKIE);
    redirect(`${redirectTo}?message=${encodeURIComponent("Volviste a tus datos reales.")}`);
  }

  if (!isPreviewPreset(preset)) {
    redirect(`${redirectTo}?error=${encodeURIComponent("Ese preview no existe.")}`);
  }

  cookieStore.set(PREVIEW_MODE_COOKIE, preset, {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
  });

  redirect(`${redirectTo}?message=${encodeURIComponent(`Preview ${preset} activado.`)}`);
}
