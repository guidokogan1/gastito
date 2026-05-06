import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { prisma } from "@/lib/db";
import { getPublicAppEnv, getSiteHostMismatch } from "@/lib/env";
import { getRequestContext } from "@/lib/request-context";

export async function GET() {
  const context = await getRequestContext();

  try {
    const env = getPublicAppEnv();
    const headerStore = await headers();
    const hostMismatch = getSiteHostMismatch(env.siteUrl, headerStore.get("host"));
    if (hostMismatch) {
      throw new Error(
        `PUBLIC_APP_SITE_URL host mismatch: expected ${hostMismatch.expectedHost}, got ${hostMismatch.actualHost}.`,
      );
    }

    await prisma.$queryRaw`SELECT 1`;
    await prisma.membership.count({ take: 1 });
    await prisma.rateLimitBucket.count();
    await prisma.auditLog.count();

    return NextResponse.json({
      ok: true,
      status: "ready",
      requestId: context.requestId,
    });
  } catch (error) {
    console.error("health_ready_failed", { requestId: context.requestId, error });

    return NextResponse.json(
      {
        ok: false,
        status: "not_ready",
        requestId: context.requestId,
      },
      { status: 503 },
    );
  }
}
