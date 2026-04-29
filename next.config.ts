import type { NextConfig } from "next";

function optionalOrigin(value: string | undefined) {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

const nextConfig: NextConfig = {
  devIndicators: false,
  serverExternalPackages: ["@prisma/client"],
  async headers() {
    const connectSources = [
      "'self'",
      "https://*.supabase.co",
      "wss://*.supabase.co",
      "https://*.neon.tech",
      "https://*.neonauth.us-east-1.aws.neon.tech",
      "https://*.neonauth.us-west-2.aws.neon.tech",
      "https://*.neonauth.eu-central-1.aws.neon.tech",
      "https://*.neonauth.ap-southeast-1.aws.neon.tech",
      optionalOrigin(process.env.NEON_AUTH_URL),
    ].filter(Boolean);

    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "form-action 'self'",
      "img-src 'self' data: blob:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline'",
      `connect-src ${connectSources.join(" ")}`,
    ].join("; ");
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
      { key: "X-Frame-Options", value: "DENY" },
      {
        key: process.env.NODE_ENV === "production" ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only",
        value: csp,
      },
    ];

    if (process.env.NODE_ENV === "production") {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }

    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
