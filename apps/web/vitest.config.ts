import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // El dominio es TS puro (sin DOM), así que el entorno Node basta.
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
