import "server-only";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import type { Prisma } from "@prisma/client";

import { requireHousehold } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { safeErrorMessage } from "@/lib/error-mapping";
import { getPublicAppEnv, getSiteHostMismatch } from "@/lib/env";
import { getRequestContext, hashValue } from "@/lib/request-context";

export { safeErrorMessage };

type RateLimitProfile = {
  max: number;
  windowMs: number;
};

const RATE_LIMITS: Record<string, RateLimitProfile> = {
  login: { max: 8, windowMs: 60_000 },
  register: { max: 5, windowMs: 60_000 },
  password_reset: { max: 3, windowMs: 60_000 },
  onboarding: { max: 6, windowMs: 60_000 },
  default: { max: 60, windowMs: 60_000 },
};

function toAuditJson(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined || value === null) return undefined;
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function assertAllowedOrigin() {
  const { siteUrl } = getPublicAppEnv();
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  const host = headerStore.get("host");

  if (!origin) return;

  const expectedOrigin = new URL(siteUrl).origin;
  const requestUrl = new URL(origin);
  const requestOrigin = requestUrl.origin;
  const isLocalDevelopmentOrigin =
    process.env.NODE_ENV !== "production" &&
    (requestUrl.hostname === "localhost" || requestUrl.hostname === "127.0.0.1");

  if (requestOrigin !== expectedOrigin && !isLocalDevelopmentOrigin) {
    throw new Error("Origen de solicitud no permitido.");
  }

  if (getSiteHostMismatch(siteUrl, host) && !isLocalDevelopmentOrigin) {
    throw new Error("Host de solicitud no permitido.");
  }
}

async function assertRateLimit(keyParts: string[], profileName: string) {
  const profile = RATE_LIMITS[profileName] ?? RATE_LIMITS.default;
  const key = hashValue(keyParts.join(":"));
  const now = new Date();
  const resetAt = new Date(now.getTime() + profile.windowMs);
  const [bucket] = await prisma.$queryRaw<Array<{ count: number; resetAt: Date }>>`
    insert into "RateLimitBucket" ("id", "key", "count", "resetAt", "createdAt", "updatedAt")
    values (${randomUUID()}, ${key}, 1, ${resetAt}, ${now}, ${now})
    on conflict ("key") do update set
      "count" = case
        when "RateLimitBucket"."resetAt" <= ${now} then 1
        else "RateLimitBucket"."count" + 1
      end,
      "resetAt" = case
        when "RateLimitBucket"."resetAt" <= ${now} then ${resetAt}
        else "RateLimitBucket"."resetAt"
      end,
      "updatedAt" = ${now}
    returning "count", "resetAt"
  `;

  if (bucket.count > profile.max) {
    throw new Error("Demasiados intentos. Probá de nuevo más tarde.");
  }
}

export async function assertAnonymousActionAllowed(action: string, subject = "anonymous") {
  await assertAllowedOrigin();
  const fingerprint = await getRequestContext();
  await assertRateLimit(["anon", action, hashValue(subject), fingerprint.ipHash], action);
}

export async function assertMutationAllowed(userId: string, action: string) {
  await assertAllowedOrigin();
  const fingerprint = await getRequestContext();
  await assertRateLimit(["user", userId, action, fingerprint.ipHash], action);
  return fingerprint;
}

export async function requireMutationContext(action: string) {
  const context = await requireHousehold();
  const request = await assertMutationAllowed(context.user.id, action);
  return { ...context, requestId: request.requestId, ipHash: request.ipHash };
}

export async function recordAuditEvent({
  userId,
  householdId,
  requestId,
  action,
  targetType,
  targetId,
  result = "success",
  before,
  after,
  errorCode,
  metadata,
}: {
  userId?: string;
  householdId?: string;
  requestId?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  result?: "success" | "failure";
  before?: unknown;
  after?: unknown;
  errorCode?: string;
  metadata?: unknown;
}) {
  try {
    const context = await getRequestContext();
    await prisma.auditLog.create({
      data: {
        userId,
        householdId,
        requestId: requestId ?? context.requestId,
        action,
        targetType,
        targetId,
        result,
        before: toAuditJson(before),
        after: toAuditJson(after),
        errorCode,
        ipHash: context.ipHash,
        metadata: toAuditJson(metadata),
      },
    });
  } catch (error) {
    console.warn("audit_log_failed", error);
  }
}
