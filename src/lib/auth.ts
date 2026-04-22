import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { prisma } from "@/lib/db";
import { getProviderUser } from "@/lib/auth-provider";

async function readCurrentUser() {
  const user = await getProviderUser();

  if (!user) return null;

  const membership = await prisma.membership.findFirst({
    where: { authUserId: user.id },
    select: {
      id: true,
      authUserId: true,
      householdId: true,
      role: true,
      createdAt: true,
      household: {
        select: {
          id: true,
          name: true,
          baseCurrency: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    membership: membership ?? null,
    household: membership?.household ?? null,
  };
}

export const getCurrentUser = cache(readCurrentUser);

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
  if (current.household) redirect("/");
  redirect("/onboarding");
}
