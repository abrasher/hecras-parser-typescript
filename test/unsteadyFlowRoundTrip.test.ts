import { describe, it, expect } from "vitest"
import { readdirSync, readFileSync } from "fs"
import { join } from "path"
import { parseUnsteadyFlow } from "../src/parseUnsteadyFlow"
import { serializeUnsteadyFlowString } from "../src/serializers/unsteadyFlow"

const dataDir = join(__dirname, "data", "unsteady_flows")

const files = readdirSync(dataDir)

describe("Unsteady flow round-trip", () => {
  for (const file of files) {
    it(`parses and serializes ${file} without errors`, () => {
      const content = readFileSync(join(dataDir, file), "utf-8")
      const parsed = parseUnsteadyFlow(content)
      const serialized = serializeUnsteadyFlowString(parsed)
      expect(serialized).toEqual(content)
      expect(parseUnsteadyFlow(serialized)).toBeDefined()
    })
  }
})
