import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getPublicAppEnv } from "@/lib/env";
import { getRequestContext } from "@/lib/request-context";

export async function GET() {
  const context = await getRequestContext();

  try {
    getPublicAppEnv();
    await prisma.$queryRaw`SELECT 1`;
    await prisma.membership.count({ take: 1 });

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
