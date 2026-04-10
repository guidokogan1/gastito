import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getPublicAppEnv } from "@/lib/env";

export async function GET() {
  try {
    const env = getPublicAppEnv();
    await prisma.$queryRaw`SELECT 1`;
    const membershipTableReachable = await prisma.membership.count();

    return NextResponse.json({
      ok: true,
      env: {
        databaseUrl: Boolean(env.databaseUrl),
        directUrl: Boolean(env.directUrl),
        supabaseUrl: Boolean(env.supabaseUrl),
        supabaseAnonKey: Boolean(env.supabaseAnonKey),
      },
      checks: {
        db: true,
        membershipTableReachable: membershipTableReachable >= 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown health error",
      },
      { status: 500 },
    );
  }
}
