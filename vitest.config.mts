import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    // .claude/worktrees holds other checkouts of this repository; their tests are not ours.
    // e2e/ holds the Playwright accessibility gate (pnpm test:a11y), not Vitest tests.
    exclude: ["**/node_modules/**", ".next/**", ".claude/**", "e2e/**"],
  },
});
