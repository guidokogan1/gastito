export function safeErrorMessage(error: { code?: string; status?: number; message?: string } | undefined, fallback: string) {
  if (!error) return fallback;
  const code = error.code?.toLowerCase() ?? "";
  const message = error.message?.toLowerCase() ?? "";

  if (code.includes("already") || message.includes("already") || message.includes("exists")) {
    return "Ya existe una cuenta con ese email.";
  }

  if (code.includes("invalid") || message.includes("invalid")) {
    return fallback;
  }

  return fallback;
}
