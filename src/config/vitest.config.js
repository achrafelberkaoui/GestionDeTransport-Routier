import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.js"],

    coverage: {
      provider: "v8",
      include: ["src/**/*.js"],
      exclude: ["src/server.js"],
      reporter: ["text", "html"],

      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
  },
});
