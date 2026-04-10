import { PrismaClient } from "@/generated/prisma";
import { assertPublicAppEnv } from "@/lib/env";

assertPublicAppEnv();

const globalForPrisma = globalThis as unknown as {
  hogarFinanzasPrisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.hogarFinanzasPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.hogarFinanzasPrisma = prisma;
}
