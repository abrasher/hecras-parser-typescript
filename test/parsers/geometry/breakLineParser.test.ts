import { describe, it, expect } from "vitest"
import { parseBreakLine } from "../../../src/parsers/geometry/breakLineParser"

describe("BreakLine Parser", () => {
  it("should parse a simple BreakLine with minimal properties", () => {
    const lines = [
      "BreakLine Name=BL-1",
      "BreakLine CellSize Min=5",
      "BreakLine CellSize Max=",
      "BreakLine Near Repeats=0",
      "BreakLine Protection Radius=0",
      "BreakLine Polyline= 4 ",
      "            100.            200.            150.            250.",
      "            200.            300.            250.            350.",
    ]

    const result = parseBreakLine(lines, 0)

    expect(result.data).toEqual({
      name: "BL-1",
      cellSizeMin: 5,
      cellSizeMax: null,
      nearRepeats: 0,
      protectionRadius: 0,
      polylinePoints: [
        [100.0, 200.0],
        [150.0, 250.0],
        [200.0, 300.0],
        [250.0, 350.0],
      ],
    })

    expect(result.linesConsumed).toBe(8)
  })

  it("should parse a BreakLine with maximum cell size", () => {
    const lines = [
      "BreakLine Name=BL-42",
      "BreakLine CellSize Min=5",
      "BreakLine CellSize Max=10",
      "BreakLine Near Repeats=0",
      "BreakLine Protection Radius=0",
      "BreakLine Polyline= 2 ",
      "    483197.68128   4749428.34159    483194.89599   4749428.11647",
    ]

    const result = parseBreakLine(lines, 0)

    expect(result.data).toEqual({
      name: "BL-42",
      cellSizeMin: 5,
      cellSizeMax: 10,
      nearRepeats: 0,
      protectionRadius: 0,
      polylinePoints: [
        [483197.68128, 4749428.34159],
        [483194.89599, 4749428.11647],
      ],
    })

    expect(result.linesConsumed).toBe(7)
  })

  it("should parse a BreakLine with many coordinate points", () => {
    const lines = [
      "BreakLine Name=BL-74",
      "BreakLine CellSize Min=5",
      "BreakLine CellSize Max=",
      "BreakLine Near Repeats=0",
      "BreakLine Protection Radius=0",
      "BreakLine Polyline= 6 ",
      "    481017.73935   4753111.93336    481018.00917   4753109.15421",
      "    481018.06111   4753108.61923    481018.13728   4753107.83465",
      "    481018.24026    4753106.7741    481018.36873   4753105.45101",
    ]

    const result = parseBreakLine(lines, 0)

    expect(result.data).toEqual({
      name: "BL-74",
      cellSizeMin: 5,
      cellSizeMax: null,
      nearRepeats: 0,
      protectionRadius: 0,
      polylinePoints: [
        [481017.73935, 4753111.93336],
        [481018.00917, 4753109.15421],
        [481018.06111, 4753108.61923],
        [481018.13728, 4753107.83465],
        [481018.24026, 4753106.7741],
        [481018.36873, 4753105.45101],
      ],
    })

    expect(result.linesConsumed).toBe(9)
  })

  it("should handle empty BreakLine CellSize Max field", () => {
    const lines = [
      "BreakLine Name=Test",
      "BreakLine CellSize Min=2",
      "BreakLine CellSize Max=",
      "BreakLine Near Repeats=1",
      "BreakLine Protection Radius=5",
      "BreakLine Polyline= 2 ",
      "            100.            200.            300.            400.",
    ]

    const result = parseBreakLine(lines, 0)

    expect(result.data.name).toBe("Test")
    expect(result.data.cellSizeMin).toBe(2)
    expect(result.data.cellSizeMax).toBe(null)
    expect(result.data.nearRepeats).toBe(1)
    expect(result.data.protectionRadius).toBe(5)
    expect(result.data.polylinePoints).toEqual([
      [100.0, 200.0],
      [300.0, 400.0],
    ])
  })

  it("should handle parsing starting from a different line index", () => {
    const lines = [
      "Some other line",
      "Another line",
      "BreakLine Name=BL-Start",
      "BreakLine CellSize Min=3",
      "BreakLine CellSize Max=",
      "BreakLine Near Repeats=0",
      "BreakLine Protection Radius=0",
      "BreakLine Polyline= 2 ",
      "              1.              2.              3.              4.",
    ]

    const result = parseBreakLine(lines, 2)

    expect(result.data.name).toBe("BL-Start")
    expect(result.linesConsumed).toBe(7)
  })
})
