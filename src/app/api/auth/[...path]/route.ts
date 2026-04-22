import { getNeonAuth } from "@/lib/neon-auth/server";

const auth = getNeonAuth();

export const { GET, POST, PUT, DELETE, PATCH } = auth.handler();
