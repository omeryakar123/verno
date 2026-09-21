import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Testler ayrı config kullanır: kök `vite.config.ts` Lovable'ın TanStack Start
 * sarmalayıcısıdır ve `test` alanını kabul etmez.
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
