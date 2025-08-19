import { describe, expect, it } from "vitest"
import { serializeRiverReach } from "../../src/serializers/geometry/riverReachSerializer"
import { parseRiverReachData } from "../../src/parsers/geometry/riverReachParser"
import type { RiverReach, CrossSectionType } from "../../src/models/geometry/riverReach"

describe("River Reach Serializer Tests", () => {
  const testRiverReach: RiverReach = {
    riverName: "Trib 21 EE",
    reachName: "Trib 21 EE",
    coordinateCount: 12,
    coordinates: [
      { x: 483651.1529, y: 4753544.9142 },
      { x: 483651.771, y: 4753544.1374 },
      { x: 483652.389, y: 4753543.3606 },
      { x: 483653.0071, y: 4753542.5837 },
      { x: 483653.6252, y: 4753541.8069 },
      { x: 483654.2432, y: 4753541.0301 },
      { x: 483654.8613, y: 4753540.2533 },
      { x: 483655.4794, y: 4753539.4765 },
      { x: 483656.0974, y: 4753538.6997 },
      { x: 483656.7155, y: 4753537.9228 },
      { x: 483657.3336, y: 4753537.146 },
      { x: 483657.9516, y: 4753536.3692 },
    ],
    textPosition: {
      x: 483651.1529,
      y: 4753544.9142,
    },
    reverseRiverText: 0,
    crossSections: [
      {
        type: 1 as CrossSectionType,
        riverMile: 1177,
        lengthLeft: 86.37,
        lengthChannel: 85.32,
        lengthRight: 77.22,
        gisLineCount: 4,
        gisLine: [
          { x: 483651.1529, y: 4753544.9142 },
          { x: 483651.771, y: 4753544.1374 },
          { x: 483652.389, y: 4753543.3606 },
          { x: 483653.0071, y: 4753542.5837 },
        ],
        lastEditedTime: "May-28-2024 10:56:01",
        stationElevationPoints: [],
        leftBankStation: 598.27,
        rightBankStation: 600.24,
        ratingCurveType: 0,
        ratingCurveValue: 0,
        htabStartingElevation: 263.14,
        htabIncrement: 0.3,
        htabCount: 30,
        htabHorizontalDistribution: [5, 5, 5],
        expansionContractionCoefficients: {
          expansion: 0.3,
          contraction: 0.1,
        },
      },
    ],
  }

  it("should serialize river reach correctly", () => {
    const serializedLines = serializeRiverReach(testRiverReach)
    expect(serializedLines.length).toBeGreaterThan(0)
    expect(serializedLines[0]).toBe("River Reach=Trib 21 EE      ,Trib 21 EE      ")
  })

  it("should handle round-trip serialization", () => {
    const originalLines = serializeRiverReach(testRiverReach)
    const parsed = parseRiverReachData(originalLines[0], originalLines, 0)

    expect(parsed.data.riverName).toBe(testRiverReach.riverName)
    expect(parsed.data.reachName).toBe(testRiverReach.reachName)
    expect(parsed.data.coordinateCount).toBe(testRiverReach.coordinateCount)
  })
})
