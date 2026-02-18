import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { parseWithSchema, serializeWithSchema } from "../../src/schema"
import { steadyFlowSchema } from "../../src/schemas/steadyFlowSchema"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function readSteadyFlow(filename: string): string[] {
  const filePath = resolve(__dirname, "../data/steady_flows", filename)
  const fileContent = readFileSync(filePath, "utf-8")
  return fileContent.replace(/\r\n/g, "\n").split("\n")
}

function roundTrip(filename: string): void {
  const lines = readSteadyFlow(filename)
  const { value } = parseWithSchema(steadyFlowSchema, lines, 0)
  const serializedLines = serializeWithSchema(steadyFlowSchema, value)
  expect(serializedLines).toEqual(lines)
}

describe("steadyFlowSchema — round-trip", () => {
  it("round trips Mixed_Flow_Regime_Channel__MIXED.f01", () => {
    roundTrip("Mixed_Flow_Regime_Channel__MIXED.f01")
  })

  it("round trips RAS_Model__Baxter.f01", () => {
    roundTrip("RAS_Model__Baxter.f01")
  })
})
