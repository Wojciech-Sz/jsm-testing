import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    include: [
      "./__tests__/integration/**/*.test.{ts,tsx}",
      "./__tests__/unit/**/*.test.{ts,tsx}",
    ],
    reporters: "verbose",
    clearMocks: true,
    watch: false,
  },
});
