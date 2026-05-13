import "server-only";

import { cookies } from "next/headers";

export const PREVIEW_MODE_COOKIE = "gastito_preview";
export const PREVIEW_PRESETS = ["empty", "lite", "full"] as const;

export type PreviewPreset = (typeof PREVIEW_PRESETS)[number];

export function isPreviewModeAvailable() {
  return process.env.NODE_ENV !== "production" || process.env.VERCEL !== "1";
}

export function isPreviewPreset(value: string | null | undefined): value is PreviewPreset {
  return PREVIEW_PRESETS.includes(value as PreviewPreset);
}

export async function getPreviewPreset() {
  if (!isPreviewModeAvailable()) return null;
  const cookieStore = await cookies();
  const value = cookieStore.get(PREVIEW_MODE_COOKIE)?.value;
  return isPreviewPreset(value) ? value : null;
}

export function previewLabel(preset: PreviewPreset | null) {
  if (preset === "empty") return "Vacío";
  if (preset === "lite") return "Lite";
  if (preset === "full") return "Full";
  return "Real";
}
