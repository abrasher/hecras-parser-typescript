import { describe, expect, it } from "vitest"
import { parseWithSchema, serializeWithSchema } from "../../src/schema"
import { breakLineSchema, type BreakLineSchema } from "../../src/schemas/breakLineSchema"
import type { BreakLine } from "../../src/models/geometry/breakLine"

describe("breakLineSchema", () => {
  const sampleLines = [
    "BreakLine Name=BL-42",
    "BreakLine CellSize Min=10",
    "BreakLine CellSize Max=25.5",
    "BreakLine Near Repeats=0",
    "BreakLine Protection Radius=5.2",
    "BreakLine Polyline= 3 ",
    "            100.            200.            150.            250.",
    "            175.            275.",
  ]

  const sampleLinesWithBlankMax = [
    "BreakLine Name=BL-43",
    "BreakLine CellSize Min=10",
    "BreakLine CellSize Max=",
    "BreakLine Near Repeats=0",
    "BreakLine Protection Radius=5.2",
    "BreakLine Polyline= 0 ",
  ]

  it("parses BreakLine geometry correctly", () => {
    const result = parseWithSchema(breakLineSchema, sampleLines, 0)

    expect(result.nextIndex).toBe(sampleLines.length)
    expect(result.value).toMatchObject({
      name: "BL-42",
      cellSizeMin: 10,
      cellSizeMax: 25.5,
      nearRepeats: 0,
      protectionRadius: 5.2,
      polylinePoints: [
        [100.0, 200.0],
        [150.0, 250.0],
        [175.0, 275.0],
      ],
    })
  })

  it("handles blank cellSizeMax as null", () => {
    const result = parseWithSchema(breakLineSchema, sampleLinesWithBlankMax, 0)

    expect(result.nextIndex).toBe(sampleLinesWithBlankMax.length)
    expect(result.value).toMatchObject({
      name: "BL-43",
      cellSizeMin: 10,
      cellSizeMax: null,
      nearRepeats: 0,
      protectionRadius: 5.2,
      polylinePoints: [],
    })
  })

  it("serializes BreakLine geometry correctly", () => {
    const breakLineData: BreakLineSchema = {
      name: "BL-42",
      cellSizeMin: 10,
      cellSizeMax: 25.5,
      nearRepeats: 0,
      protectionRadius: 5.2,
      polylinePoints: [
        [100.0, 200.0],
        [150.0, 250.0],
        [175.0, 275.0],
      ],
    }

    const lines = serializeWithSchema(breakLineSchema, breakLineData)

    expect(lines).toEqual([
      "BreakLine Name=BL-42",
      "BreakLine CellSize Min=10",
      "BreakLine CellSize Max=25.5",
      "BreakLine Near Repeats=0",
      "BreakLine Protection Radius=5.2",
      "BreakLine Polyline=3",
      "           100.0           200.0           150.0           250.0",
      "           175.0           275.0",
    ])
  })

  it("serializes null cellSizeMax as blank", () => {
    const breakLineData: BreakLineSchema = {
      name: "BL-43",
      cellSizeMin: 10,
      cellSizeMax: null,
      nearRepeats: 0,
      protectionRadius: 5.2,
      polylinePoints: [],
    }

    const lines = serializeWithSchema(breakLineSchema, breakLineData)

    expect(lines).toEqual([
      "BreakLine Name=BL-43",
      "BreakLine CellSize Min=10",
      "BreakLine CellSize Max=",
      "BreakLine Near Repeats=0",
      "BreakLine Protection Radius=5.2",
      "BreakLine Polyline=0",
    ])
  })

  // Type compatibility test - ensure BreakLineSchema is assignable to BreakLine
  it("maintains type compatibility with existing BreakLine model", () => {
    const schemaData: BreakLineSchema = {
      name: "BL-42",
      cellSizeMin: 10,
      cellSizeMax: 25.5,
      nearRepeats: 0,
      protectionRadius: 5.2,
      polylinePoints: [[100, 200], [150, 250]],
    }

    // This should compile without error - schema-first typing
    const modelData: BreakLine = schemaData

    expect(modelData.name).toBe("BL-42")
    expect(modelData.cellSizeMax).toBe(25.5)
    expect(modelData.polylinePoints).toHaveLength(2)
  })
})