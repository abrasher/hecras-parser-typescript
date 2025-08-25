import { describe, it, expect } from "vitest"
import { serializeBreakLine } from "../../../src/serializers/geometry/breakLineSerializer"
import type { BreakLine } from "../../../src/models/geometry/breakLine"

describe("BreakLine Serializer", () => {
  it("should serialize a simple BreakLine with minimal properties", () => {
    const breakLine: BreakLine = {
      name: "BL-1",
      cellSizeMin: 5,
      cellSizeMax: null,
      nearRepeats: 0,
      protectionRadius: 0,
      polylinePoints: [
        { x: 100, y: 200 },
        { x: 150, y: 250 },
        { x: 200, y: 300 },
        { x: 250, y: 350 },
      ],
    }

    const result = serializeBreakLine(breakLine)

    expect(result).toEqual([
      "BreakLine Name=BL-1",
      "BreakLine CellSize Min=5",
      "BreakLine CellSize Max=",
      "BreakLine Near Repeats=0",
      "BreakLine Protection Radius=0",
      "BreakLine Polyline= 4 ",
      "            100.            200.            150.            250.",
      "            200.            300.            250.            350.",
    ])
  })

  it("should serialize a BreakLine with maximum cell size", () => {
    const breakLine: BreakLine = {
      name: "BL-42",
      cellSizeMin: 5,
      cellSizeMax: 10,
      nearRepeats: 0,
      protectionRadius: 0,
      polylinePoints: [
        { x: 483197.68128, y: 4749428.34159 },
        { x: 483194.89599, y: 4749428.11647 },
      ],
    }

    const result = serializeBreakLine(breakLine)

    expect(result).toEqual([
      "BreakLine Name=BL-42",
      "BreakLine CellSize Min=5",
      "BreakLine CellSize Max=10",
      "BreakLine Near Repeats=0",
      "BreakLine Protection Radius=0",
      "BreakLine Polyline= 2 ",
      "    483197.68128   4749428.34159    483194.89599   4749428.11647",
    ])
  })

  it("should serialize a BreakLine with many coordinate points", () => {
    const breakLine: BreakLine = {
      name: "BL-74",
      cellSizeMin: 5,
      cellSizeMax: null,
      nearRepeats: 0,
      protectionRadius: 0,
      polylinePoints: [
        { x: 481017.73935, y: 4753111.93336 },
        { x: 481018.00917, y: 4753109.15421 },
        { x: 481018.06111, y: 4753108.61923 },
        { x: 481018.13728, y: 4753107.83465 },
        { x: 481018.24026, y: 4753106.7741 },
        { x: 481018.36873, y: 4753105.45101 },
      ],
    }

    const result = serializeBreakLine(breakLine)

    expect(result).toEqual([
      "BreakLine Name=BL-74",
      "BreakLine CellSize Min=5",
      "BreakLine CellSize Max=",
      "BreakLine Near Repeats=0",
      "BreakLine Protection Radius=0",
      "BreakLine Polyline= 6 ",
      "    481017.73935   4753111.93336    481018.00917   4753109.15421",
      "    481018.06111   4753108.61923    481018.13728   4753107.83465",
      "    481018.24026    4753106.7741    481018.36873   4753105.45101",
    ])
  })

  it("should serialize BreakLine with non-zero properties", () => {
    const breakLine: BreakLine = {
      name: "Test-BreakLine",
      cellSizeMin: 2.5,
      cellSizeMax: 15,
      nearRepeats: 1,
      protectionRadius: 5,
      polylinePoints: [
        { x: 100, y: 200 },
        { x: 300, y: 400 },
      ],
    }

    const result = serializeBreakLine(breakLine)

    expect(result).toEqual([
      "BreakLine Name=Test-BreakLine",
      "BreakLine CellSize Min=2.5",
      "BreakLine CellSize Max=15",
      "BreakLine Near Repeats=1",
      "BreakLine Protection Radius=5",
      "BreakLine Polyline= 2 ",
      "            100.            200.            300.            400.",
    ])
  })

  it("should serialize BreakLine with empty CellSize Max", () => {
    const breakLine: BreakLine = {
      name: "Empty-Max",
      cellSizeMin: 3,
      cellSizeMax: null,
      nearRepeats: 2,
      protectionRadius: 1,
      polylinePoints: [{ x: 10, y: 20 }],
    }

    const result = serializeBreakLine(breakLine)

    expect(result[0]).toBe("BreakLine Name=Empty-Max")
    expect(result[1]).toBe("BreakLine CellSize Min=3")
    expect(result[2]).toBe("BreakLine CellSize Max=")
    expect(result[3]).toBe("BreakLine Near Repeats=2")
    expect(result[4]).toBe("BreakLine Protection Radius=1")
    expect(result[5]).toBe("BreakLine Polyline= 1 ")
  })

  it("should handle odd number of coordinate points correctly", () => {
    const breakLine: BreakLine = {
      name: "Odd-Points",
      cellSizeMin: 1,
      cellSizeMax: null,
      nearRepeats: 0,
      protectionRadius: 0,
      polylinePoints: [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
        { x: 5, y: 6 },
      ],
    }

    const result = serializeBreakLine(breakLine)

    expect(result).toEqual([
      "BreakLine Name=Odd-Points",
      "BreakLine CellSize Min=1",
      "BreakLine CellSize Max=",
      "BreakLine Near Repeats=0",
      "BreakLine Protection Radius=0",
      "BreakLine Polyline= 3 ",
      "              1.              2.              3.              4.",
      "              5.              6.",
    ])
  })
})
