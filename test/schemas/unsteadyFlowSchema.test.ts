import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { parseWithSchema, serializeWithSchema } from "../../src/schema"
import { unsteadyFlowSchema } from "../../src/schemas/unsteadyFlowSchema"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function readUnsteadyFlow(filename: string): string[] {
  const filePath = resolve(__dirname, "../data/unsteady_flows", filename)
  const fileContent = readFileSync(filePath, "utf-8")
  return fileContent.replace(/\r\n/g, "\n").split("\n")
}

function roundTrip(filename: string): void {
  const lines = readUnsteadyFlow(filename)
  const { value } = parseWithSchema(unsteadyFlowSchema, lines, 0)
  const serializedLines = serializeWithSchema(unsteadyFlowSchema, value)
  expect(serializedLines).toEqual(lines)
}

describe("unsteadyFlowSchema - round-trip", () => {
  it("round trips Muncie.u01 (Program Version=6.30)", () => {
    roundTrip("Muncie.u01")
  })

  it("round trips BaldEagleDamBrk.u03 (Program Version=6.00)", () => {
    roundTrip("BaldEagleDamBrk.u03")
  })
})
