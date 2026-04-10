import { describe, expect, it, vi } from "vitest";

import { getPublicAppEnv } from "@/lib/env";

describe("public app env", () => {
  it("throws when a required variable is missing", () => {
    vi.stubEnv("PUBLIC_APP_DATABASE_URL", "");
    vi.stubEnv("PUBLIC_APP_DIRECT_URL", "postgresql://direct");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");

    expect(() => getPublicAppEnv()).toThrow(/PUBLIC_APP_DATABASE_URL/);
  });
});
