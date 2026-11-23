import { describe, expect, it } from "vitest";
import nextConfig, { resolveBuildCommit, securityHeaders } from "../next.config";

/** The hardening in next.config.ts is a stated property of the deployment; keep it pinned. */
describe("next.config.ts hardening", () => {
  it("does not advertise the framework in a response header", () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });

  it("keeps the image optimiser endpoint closed (no next/image is rendered)", () => {
    expect(nextConfig.images?.unoptimized).toBe(true);
  });

  it("sends the agreed security headers on every route", async () => {
    expect(nextConfig.headers).toBeTypeOf("function");
    const routes = await nextConfig.headers!();
    const everyRoute = routes.find((r) => r.source === "/:path*");
    expect(everyRoute).toBeDefined();
    const byKey = Object.fromEntries(everyRoute!.headers.map((h) => [h.key, h.value]));

    expect(byKey["X-Content-Type-Options"]).toBe("nosniff");
    expect(byKey["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(byKey["X-Frame-Options"]).toBe("DENY");
    expect(byKey["Permissions-Policy"]).toBe("camera=(), microphone=(), geolocation=()");

    const csp = byKey["Content-Security-Policy"];
    expect(csp).toBeDefined();
    const directives = csp.split(";").map((d) => d.trim());
    expect(directives).toContain("default-src 'self'");
    expect(directives).toContain("frame-ancestors 'none'");
    expect(directives).toContain("object-src 'none'");
    expect(directives).toContain("base-uri 'self'");
    expect(directives).toContain("form-action 'self'");
    expect(directives).toContain("font-src 'self'");
    expect(directives).toContain("img-src 'self' data:");
    // Outside the dev server no directive may allow eval.
    expect(csp).not.toContain("unsafe-eval");
  });

  it("stamps the build with a commit SHA or 'unknown', without any network call", () => {
    expect(nextConfig.env?.BUILD_COMMIT_SHA).toMatch(/^[0-9a-f]{40}$|^unknown$/);
    expect(nextConfig.env?.BUILD_DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(resolveBuildCommit({ VERCEL_GIT_COMMIT_SHA: "a".repeat(40) })).toBe("a".repeat(40));
    expect(resolveBuildCommit({ GITHUB_SHA: "b".repeat(40) })).toBe("b".repeat(40));
    expect(resolveBuildCommit({ VERCEL_GIT_COMMIT_SHA: "c".repeat(40), GITHUB_SHA: "b".repeat(40) })).toBe("c".repeat(40));
  });

  it("exports the same header list it serves", async () => {
    const routes = await nextConfig.headers!();
    expect(routes[0]?.headers).toEqual(securityHeaders.map((h) => ({ ...h })));
  });
});
