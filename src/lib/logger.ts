type LogContext = Record<string, unknown>;

function write(level: "info" | "warn" | "error", event: string, context: LogContext = {}) {
  const payload = {
    level,
    event,
    at: new Date().toISOString(),
    ...context,
  };
  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

export function logInfo(event: string, context?: LogContext) {
  write("info", event, context);
}

export function logWarn(event: string, context?: LogContext) {
  write("warn", event, context);
}

export function logError(event: string, context?: LogContext) {
  write("error", event, context);
}
