/// <reference types="vitest" />
import { defineConfig } from "vite"

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "HecrasParser",
      fileName: "hecras-parser",
      formats: ["es", "cjs"],
    },
  },
  test: {
    environment: "jsdom",
  },
})
