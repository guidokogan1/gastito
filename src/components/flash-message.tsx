export function FlashMessage({
  message,
  tone = "info",
}: {
  message?: string;
  tone?: "info" | "error";
}) {
  if (!message) return null;

  return (
    <div className={tone === "error" ? "flash flash-error" : "flash"}>
      {message}
    </div>
  );
}
