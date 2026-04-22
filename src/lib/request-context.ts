import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";

export function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function getRequestContext() {
  const headerStore = await headers();
  const requestId = headerStore.get("x-request-id") ?? crypto.randomUUID();
  const forwardedFor = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headerStore.get("x-real-ip")?.trim();
  const ip = forwardedFor || realIp || "local";

  return {
    requestId,
    ipHash: hashValue(ip),
  };
}
