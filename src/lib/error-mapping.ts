export function safeErrorMessage(error: { code?: string; status?: number; message?: string } | undefined, fallback: string) {
  if (!error) return fallback;
  const code = error.code?.toLowerCase() ?? "";
  const message = error.message?.toLowerCase() ?? "";
  const combined = `${code} ${message}`;

  if (
    combined.includes("already") ||
    combined.includes("exists") ||
    combined.includes("user_already") ||
    combined.includes("email_exists")
  ) {
    return "Ya existe una cuenta con ese email.";
  }

  if (combined.includes("email_not_confirmed") || combined.includes("not confirmed") || combined.includes("verify")) {
    return "La cuenta existe, pero falta verificar el email. Revisá tu correo o usá Recuperar contraseña.";
  }

  if (combined.includes("weak_password") || combined.includes("password") && combined.includes("weak")) {
    return "La contraseña no cumple los requisitos del proveedor. Probá con una más larga y difícil de adivinar.";
  }

  if (combined.includes("rate_limit") || combined.includes("too many")) {
    return "Hubo demasiados intentos. Esperá unos minutos y probá de nuevo.";
  }

  if (combined.includes("invalid")) {
    return fallback;
  }

  return fallback;
}
