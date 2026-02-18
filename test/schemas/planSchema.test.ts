import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { parseWithSchema, serializeWithSchema } from "../../src/schema"
import { planSchema } from "../../src/schemas/planSchema"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function readPlan(filename: string): string[] {
  const filePath = resolve(__dirname, "../data/plans", filename)
  const fileContent = readFileSync(filePath, "utf-8")
  return fileContent.replace(/\r\n/g, "\n").split("\n")
}

function parseSerializeParse(filename: string): void {
  const inputLines = readPlan(filename)
  const { value: parsed } = parseWithSchema(planSchema, inputLines, 0)
  const serializedLines = serializeWithSchema(planSchema, parsed)
  const { value: reparsed } = parseWithSchema(planSchema, serializedLines, 0)

  expect(serializedLines).toEqual(inputLines)
  expect(reparsed).toEqual(parsed)
}

describe("planSchema — round-trip", () => {
  it("round trips BaldEagleDamBrk.p06 (2D settings, UNET D2 blocks)", () => {
    parseSerializeParse("BaldEagleDamBrk.p06")
  })

  it("round trips WaterQualityExamp.p01 (water quality and unsteady config)", () => {
    parseSerializeParse("WaterQualityExamp.p01")
  })
})

describe("planSchema — scientific notation formatting", () => {
  it("preserves UNET D2 ILUT Tolerance lexical form as 1E-08", () => {
    const lines = readPlan("BaldEagleDamBrk.p06")
    const { value } = parseWithSchema(planSchema, lines, 0)
    const serializedLines = serializeWithSchema(planSchema, value)

    const toleranceLines = serializedLines.filter((line) =>
      line.startsWith("UNET D2 ILUT Tolerance="),
    )

    expect(toleranceLines).toEqual(["UNET D2 ILUT Tolerance=1E-08", "UNET D2 ILUT Tolerance=1E-08"])
    expect(value.unetD2ILUTTolerance).toBe(1e-8)
    expect(value.unetD2FlowAreas?.[0]?.ilutTolerance).toBe(1e-8)
  })
})
