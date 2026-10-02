import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// A Vercel builda com NODE_ENV=production, e aí o React carrega a versão sem
// `act`, o que quebra o Testing Library. Força o ambiente de teste.
(process.env as Record<string, string>).NODE_ENV = "test";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/tests/**/*.{test,spec}.{ts,tsx}"],
  },
});
