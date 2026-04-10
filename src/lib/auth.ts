import "server-only";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return null;
  }

  const membership = await prisma.membership.findFirst({
    where: { authUserId: user.id },
    include: { household: true },
    orderBy: { createdAt: "asc" },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    membership: membership ?? null,
    household: membership?.household ?? null,
    supabase,
  };
}

export async function requireUser() {
  const current = await getCurrentUser();
  if (!current) redirect("/login");
  return current;
}

export async function requireHousehold() {
  const current = await requireUser();
  if (!current.household) redirect("/onboarding");
  return {
    user: current.user,
    membership: current.membership,
    household: current.household,
  };
}

export async function redirectIfAuthenticated() {
  const current = await getCurrentUser();
  if (!current) return;
  if (current.household) {
    redirect("/");
  }
  redirect("/onboarding");
}
