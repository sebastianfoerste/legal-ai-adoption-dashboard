import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Static Content-Security-Policy, after the "Without Nonces" section of the bundled guide
// (node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md). The app fetches
// no external script, style, font or image, so every source is 'self'. 'unsafe-inline' for
// scripts is what the nonce-less pattern needs for the inline bootstrap of the App Router;
// 'unsafe-eval' is added only for the development server.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

/** Response headers sent on every route; asserted by lib/next-config.test.ts. */
export const securityHeaders: ReadonlyArray<{ key: string; value: string }> = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  // No `x-powered-by: Next.js` response header.
  poweredByHeader: false,
  // The app renders no next/image, so the /_next/image optimiser endpoint stays closed.
  images: { unoptimized: true },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders.map((h) => ({ ...h })),
      },
    ];
  },
};

export default nextConfig;
