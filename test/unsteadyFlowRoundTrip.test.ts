import { describe, it, expect } from "vitest"
import { readFileSync } from "fs"
import { join } from "path"
import { parseUnsteadyFlow } from "../src/parseUnsteadyFlow"
import { serializeUnsteadyFlowString } from "../src/serializers/unsteadyFlow"

const dataDir = join(__dirname, "data", "unsteady_flows")

describe("Unsteady flow round-trip", () => {
  it(`parses and serializes Muncie.u01 without errors`, () => {
    const content = readFileSync(join(dataDir, "Muncie.u01"), "utf-8")
    const parsed = parseUnsteadyFlow(content)
    const serialized = serializeUnsteadyFlowString(parsed)
    expect(serialized).toEqual(content)
    expect(parseUnsteadyFlow(serialized)).toBeDefined()
  })
})
