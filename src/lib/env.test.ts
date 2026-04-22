import { describe, expect, it, vi } from "vitest";

import { getPublicAppEnv } from "@/lib/env";

describe("public app env", () => {
  it("throws when a required variable is missing", () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("PUBLIC_APP_DATABASE_URL", "");
    vi.stubEnv("DIRECT_DATABASE_URL", "postgresql://direct");
    vi.stubEnv("PUBLIC_APP_SITE_URL", "http://localhost:3000");

    expect(() => getPublicAppEnv()).toThrow(/DATABASE_URL/);
  });

  it("supports Neon as the default auth provider", () => {
    vi.stubEnv("DATABASE_URL", "postgresql://pooled");
    vi.stubEnv("DIRECT_DATABASE_URL", "postgresql://direct");
    vi.stubEnv("PUBLIC_APP_SITE_URL", "http://localhost:3000");
    vi.stubEnv("NEON_AUTH_URL", "https://example.neonauth.us-east-1.aws.neon.tech/neondb/auth");
    vi.stubEnv("NEON_AUTH_COOKIE_SECRET", "secret");

    expect(getPublicAppEnv()).toMatchObject({
      authProvider: "neon",
      siteUrl: "http://localhost:3000",
    });
  });
});
