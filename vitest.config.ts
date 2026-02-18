import { configDefaults, defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    exclude: [...configDefaults.exclude, ".worktree/**", ".conductor/**"],
    typecheck: {
      ignoreSourceErrors: true,
      include: ["test/**/*.test-d.ts"],
      exclude: [".worktree/**", ".conductor/**"],
    },
  },
})
