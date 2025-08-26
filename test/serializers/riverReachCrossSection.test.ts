import { describe, expect, it } from "vitest"
import { serializeRiverReach } from "../../src/serializers/geometry/riverReachSerializer"
import { parseRiverReachData } from "../../src/parsers/geometry/riverReachParser"
import type { RiverReach } from "../../src/models/geometry/riverReach"

describe("River Reach Cross-Section Serializer Tests", () => {
  it("should serialize complete cross-section data", () => {
    const testRiverReach: RiverReach = {
      riverName: "Test River",
      reachName: "Test Reach",
      coordinateCount: 2,
      coordinates: [
        { x: 483651.1529, y: 4753544.9142 },
        { x: 483651.771, y: 4753544.1374 },
      ],
      crossSections: [
        {
          type: 1,
          riverMile: "658",
          lengthLeft: 196.48,
          lengthChannel: 197.81,
          lengthRight: 198.83,
          leftBankStation: 689.93,
          rightBankStation: 693.28,
          stationElevationCount: 3,
          stationElevationPoints: [
            { station: 0, elevation: 266.05 },
            { station: 1, elevation: 266.08 },
            { station: 2, elevation: 266.04 },
          ],
          manningCount: 2,
          manningValues: [
            { station: 0, nValue: 0.015, unknownParameter: 0 },
            { station: 6.31, nValue: 0.18, unknownParameter: 0 },
          ],
          ineffectiveCount: 1,
          ineffectiveFlowAreas: [{ leftStation: 530.05, rightStation: 562.91, elevation: 264.16 }],
          expansionContractionCoefficients: {
            expansion: 0.3,
            contraction: 0.1,
          },
          skewAngle: 5,
        },
      ],
    }

    const serializedLines = serializeRiverReach(testRiverReach)

    expect(serializedLines).toContain("River Reach=Test River      ,Test Reach      ")
    // expect(serializedLines).toContain("Type RM Length L Ch R = 1 ,658        ,196.48,197.81,198.83")
    expect(serializedLines).toContain("Bank Sta=689.93,693.28")
    expect(serializedLines).toContain("#Sta/Elev= 3 ")
    expect(serializedLines.some((line) => line.includes("#Mann="))).toBe(true)
    expect(serializedLines.some((line) => line.includes("#XS Ineff="))).toBe(true)
    expect(serializedLines.some((line) => line.includes("Skew Angle="))).toBe(true)
  })

  it("should handle round-trip parsing and serialization", () => {
    const testRiverReach: RiverReach = {
      riverName: "Test River",
      reachName: "Test Reach",
      coordinateCount: 2,
      coordinates: [
        { x: 483651.1529, y: 4753544.9142 },
        { x: 483651.771, y: 4753544.1374 },
      ],
      crossSections: [
        {
          type: 1,
          riverMile: "100",
          lengthLeft: 50,
          lengthChannel: 55,
          lengthRight: 60,
          stationElevationCount: 2,
          stationElevationPoints: [
            { station: 0, elevation: 100 },
            { station: 10, elevation: 95 },
          ],
        },
      ],
    }

    // Serialize to text
    const serializedLines = serializeRiverReach(testRiverReach)

    // Parse back from text
    const parsedData = parseRiverReachData(serializedLines[0], serializedLines, 0)

    // Check key properties match
    expect(parsedData.data.riverName).toBe(testRiverReach.riverName)
    expect(parsedData.data.reachName).toBe(testRiverReach.reachName)
    expect(parsedData.data.crossSections).toHaveLength(1)
    expect(parsedData.data.crossSections[0].riverMile).toBe("100")
    expect(parsedData.data.crossSections[0].stationElevationCount).toBe(2)
    expect(parsedData.data.crossSections[0].stationElevationPoints).toHaveLength(2)
  })
})
