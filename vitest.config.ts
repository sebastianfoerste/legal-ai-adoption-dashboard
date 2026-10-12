import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    // .claude/worktrees holds other checkouts of this repository; their tests are not ours.
    exclude: ["**/node_modules/**", ".next/**", ".claude/**"],
  },
});
