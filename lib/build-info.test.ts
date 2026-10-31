import { describe, expect, it } from "vitest";
import { REPOSITORY_URL, buildStamp } from "./build-info";

describe("buildStamp", () => {
  it("shortens a full SHA to seven characters and links to the commit", () => {
    const sha = "4fc25c5e2e3292e1b1063a1570aa4c04cb9b89c7";
    const stamp = buildStamp(sha, "2026-10-31");
    expect(stamp.short).toBe("4fc25c5");
    expect(stamp.url).toBe(`${REPOSITORY_URL}/commit/${sha}`);
    expect(stamp.label).toBe("Build 4fc25c5 (2026-10-31)");
  });

  it("falls back to unknown without a link when the SHA is missing or not a SHA", () => {
    for (const value of [undefined, "", "unknown", "not a sha", "4fc25c"]) {
      const stamp = buildStamp(value, "2026-10-31");
      expect(stamp.short).toBe("unknown");
      expect(stamp.sha).toBe("unknown");
      expect(stamp.url).toBeNull();
      expect(stamp.label).toBe("Build unknown (2026-10-31)");
    }
  });

  it("drops a date it cannot read instead of printing it", () => {
    expect(buildStamp("4fc25c5", undefined).label).toBe("Build 4fc25c5");
    expect(buildStamp("4fc25c5", "yesterday").date).toBeNull();
  });

  it("normalises whitespace and case", () => {
    expect(buildStamp(" 4FC25C5E2E3292E1B1063A1570AA4C04CB9B89C7\n", " 2026-10-31 ").short).toBe("4fc25c5");
  });
});
