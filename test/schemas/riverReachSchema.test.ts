import { describe, expect, it } from "vitest"
import { parseWithSchema, serializeWithSchema } from "../../src/schema"
import { riverReachSchema, type RiverReachSchema } from "../../src/schemas/riverReachSchema"

describe("riverReachSchema", () => {
  const sampleLines = [
    "River Reach=Trib 21 EE      ,Trib 21 EE      ",
    "Reach XY= 2 ",
    "     483651.1529    4753544.9142      483651.771    4753544.1374",
    "Rch Text X Y=483651.1529,4753544.9142",
    "Reverse River Text= 0 ",
    "",
  ]

  const sampleCoordinates: RiverReachSchema["coordinates"] = [
    [483651.1529, 4753544.9142],
    [483651.771, 4753544.1374],
  ]

  it("parses a River Reach block with coordinates, text position, and reverse flag", () => {
    const result = parseWithSchema(riverReachSchema, sampleLines, 0)

    expect(result.nextIndex).toBe(sampleLines.length)
    expect(result.value).toMatchObject({
      riverName: "Trib 21 EE",
      reachName: "Trib 21 EE",
      coordinates: sampleCoordinates,
      coordinateCount: 2,
      textPosition: [483651.1529, 4753544.9142],
      reverseRiverText: 0,
    })
  })

  it("serializes a River Reach block with padded names and coordinate data", () => {
    const riverReach: RiverReachSchema = {
      riverName: "Trib 21 EE",
      reachName: "Trib 21 EE",
      coordinates: sampleCoordinates,
      coordinateCount: 2,
      textPosition: [483651.1529, 4753544.9142],
      reverseRiverText: 0,
    }

    const lines = serializeWithSchema(riverReachSchema, riverReach)

    expect(lines).toEqual(sampleLines)
  })

  it("omits optional fields while still emitting the trailing blank line", () => {
    const riverReach: RiverReachSchema = {
      riverName: "River A",
      reachName: "Reach B",
      coordinates: [],
    }

    const lines = serializeWithSchema(riverReachSchema, riverReach)

    expect(lines).toEqual([
      "River Reach=River A         ,Reach B         ",
      "Reach XY= 0 ",
      "",
    ])
  })

  it("serializes non-zero reverse river text values without a leading pad", () => {
    const riverReach: RiverReachSchema = {
      riverName: "River",
      reachName: "Reach",
      coordinates: sampleCoordinates,
      coordinateCount: 2,
      reverseRiverText: 5,
    }

    const lines = serializeWithSchema(riverReachSchema, riverReach)

    expect(lines).toContain("Reverse River Text=5 ")
  })

  it("throws if coordinateCount does not match coordinates length", () => {
    const riverReach: RiverReachSchema = {
      riverName: "River",
      reachName: "Reach",
      coordinates: sampleCoordinates,
      coordinateCount: 999,
    }

    expect(() => serializeWithSchema(riverReachSchema, riverReach)).toThrow(
      /coordinateCount \(999\) does not match coordinates length \(2\)/,
    )
  })

  it("round-trips parse → serialize → parse without data loss", () => {
    const parsed = parseWithSchema(riverReachSchema, sampleLines, 0)
    const serialized = serializeWithSchema(riverReachSchema, parsed.value)
    const reparsed = parseWithSchema(riverReachSchema, serialized, 0)

    expect(reparsed.value).toEqual(parsed.value)
  })
})
