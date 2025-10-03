import { describe, expect, it } from "vitest"
import { parseWithSchema, serializeWithSchema } from "../../../src/schema"
import { breakLineSchema, type BreakLineSchema } from "../../src/schemas/breakLineSchema"

describe("breakLineSchema", () => {
  const sampleLines = [
    "BreakLine Name=BL-42",
    "BreakLine CellSize Min=10",
    "BreakLine CellSize Max=25.5",
    "BreakLine Near Repeats=0",
    "BreakLine Protection Radius=5.2",
    "BreakLine Polyline= 4 ",
    "275702.2378993385274628.53927988275718.2256674615274621.13031416",
    "275729.7290615985274615.86604905275736.8096161665274610.84529217",
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
        [275702.237899338, 5274628.53927988],
        [275718.225667461, 5274621.13031416],
        [275729.729061598, 5274615.86604905],
        [275736.809616166, 5274610.84529217],
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
        [275702.237899338, 5274628.53927988],
        [275718.225667461, 5274621.13031416],
        [275729.729061598, 5274615.86604905],
        [275736.809616166, 5274610.84529217],
      ],
    }

    const lines = serializeWithSchema(breakLineSchema, breakLineData)

    expect(lines).toEqual([
      "BreakLine Name=BL-42",
      "BreakLine CellSize Min=10",
      "BreakLine CellSize Max=25.5",
      "BreakLine Near Repeats=0",
      "BreakLine Protection Radius=5.2",
      "BreakLine Polyline= 4 ",
      "275702.2378993385274628.53927988275718.2256674615274621.13031416",
      "275729.7290615985274615.86604905275736.8096161665274610.84529217",
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
      "BreakLine Polyline= 0 ",
    ])
  })
})
