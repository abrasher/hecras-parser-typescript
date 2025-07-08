import { describe, expect, it } from "vitest"
import {
  serializeCulvertGroups,
  serializeCulvertGroup,
  serializeCulvertBarrel,
} from "../../src/serializers/geometry/culvertSerializer"
import { parseCulvertData } from "../../src/parsers/geometry/culvertParser"
import type { CulvertGroupProperties } from "../../src/models/geometry/culvert"

describe("Culvert Serializer Tests", () => {
  // Test data from ConnectionCulvert.test.ts
  const lineString = `Connection Culv=1,1.5,1.5,13.24,0.024,0.9,1,2,3,260.71,260.64, 2 ,Group #1  , 0 ,
    3.56    4.96    6.56    9.96
Conn Culvert Barrel=1,Barrel #01,2
    484557.98934   4751436.44773     484544.9229   4751438.60715
Conn Culvert Barrel=2,Barrel #02,3
    414557.989346744151436.44773     434544.9229   4351438.60715
     424544.9229   4251438.60715
Connection Culv=1,1.5,1.5,13.24,0.024,0.9,1,2,3,260.71,260.64, 1 ,Group #2  , 0 ,
    3.56    4.96
Conn Culvert Barrel=1,Barrel #01,0`

  const testCulvertData: CulvertGroupProperties[] = [
    {
      shape: 1,
      rise: 1.5,
      span: 1.5,
      length: 13.24,
      nTop: 0.024,
      entranceLoss: 0.9,
      exitLoss: 1,
      chart: 2,
      scale: 3,
      upstreamInvert: 260.71,
      downstreamInvert: 260.64,
      numberOfBarrels: 2,
      culvertGroupName: "Group #1",
      unknownFlag: 0,
      barrelStations: [
        {
          upstreamStation: 3.56,
          downstreamStation: 4.96,
        },
        {
          upstreamStation: 6.56,
          downstreamStation: 9.96,
        },
      ],
      barrels: [
        {
          index: 1,
          name: "Barrel #01",
          coordinates: [
            {
              x: 484557.98934,
              y: 4751436.44773,
            },
            {
              x: 484544.9229,
              y: 4751438.60715,
            },
          ],
        },
        {
          index: 2,
          name: "Barrel #02",
          coordinates: [
            {
              x: 414557.98934,
              y: 6744151436.44773,
            },
            {
              x: 434544.9229,
              y: 4351438.60715,
            },
            {
              x: 424544.9229,
              y: 4251438.60715,
            },
          ],
        },
      ],
    },
    {
      shape: 1,
      rise: 1.5,
      span: 1.5,
      length: 13.24,
      nTop: 0.024,
      entranceLoss: 0.9,
      exitLoss: 1,
      chart: 2,
      scale: 3,
      upstreamInvert: 260.71,
      downstreamInvert: 260.64,
      numberOfBarrels: 1,
      culvertGroupName: "Group #2",
      unknownFlag: 0,
      barrelStations: [
        {
          upstreamStation: 3.56,
          downstreamStation: 4.96,
        },
      ],
      barrels: [
        {
          index: 1,
          name: "Barrel #01",
          coordinates: [],
        },
      ],
    },
  ]

  describe("serializeCulvertBarrel", () => {
    it("should serialize barrel with coordinates", () => {
      const barrel = testCulvertData[0].barrels[0]
      const result = serializeCulvertBarrel(barrel)

      expect(result).toEqual([
        "Conn Culvert Barrel=1,Barrel #01,2",
        "    484557.98934   4751436.44773     484544.9229   4751438.60715",
      ])
    })

    it("should serialize barrel with no coordinates", () => {
      const barrel = testCulvertData[1].barrels[0]
      const result = serializeCulvertBarrel(barrel)

      expect(result).toEqual(["Conn Culvert Barrel=1,Barrel #01,0"])
    })

    it("should serialize barrel with multiple coordinate lines", () => {
      const barrel = testCulvertData[0].barrels[1]
      const result = serializeCulvertBarrel(barrel)

      expect(result).toEqual([
        "Conn Culvert Barrel=2,Barrel #02,3",
        "    414557.989346744151436.44773     434544.9229   4351438.60715",
        "     424544.9229   4251438.60715",
      ])
    })
  })

  describe("serializeCulvertGroup", () => {
    it("should serialize first culvert group", () => {
      const culvert = testCulvertData[0]
      const result = serializeCulvertGroup(culvert)

      // Check main connection line
      expect(result[0]).toBe("Connection Culv=1,1.5,1.5,13.24,0.024,0.9,1,2,3,260.71,260.64, 2 ,Group #1  , 0 ,")

      // Check station pairs line
      expect(result[1]).toBe("    3.56    4.96    6.56    9.96")

      // Check barrel lines
      expect(result[2]).toBe("Conn Culvert Barrel=1,Barrel #01,2")
      expect(result[3]).toBe("    484557.98934   4751436.44773     484544.9229   4751438.60715")
      expect(result[4]).toBe("Conn Culvert Barrel=2,Barrel #02,3")
      expect(result[5]).toBe("    414557.989346744151436.44773     434544.9229   4351438.60715")
      expect(result[6]).toBe("     424544.9229   4251438.60715")
    })

    it("should serialize second culvert group", () => {
      const culvert = testCulvertData[1]
      const result = serializeCulvertGroup(culvert)

      expect(result).toEqual([
        "Connection Culv=1,1.5,1.5,13.24,0.024,0.9,1,2,3,260.71,260.64, 1 ,Group #2  , 0 ,",
        "    3.56    4.96",
        "Conn Culvert Barrel=1,Barrel #01,0",
      ])
    })
  })

  describe("serializeCulvertGroups", () => {
    it("should serialize multiple culvert groups", () => {
      const result = serializeCulvertGroups(testCulvertData)
      const expected = lineString.split("\n")

      expect(result).toEqual(expected)
    })
  })

  describe("round-trip tests", () => {
    it("should parse and serialize back to identical format", () => {
      const lines = lineString.split("\n")
      const parsed = parseCulvertData(lines[0], lines, 0)
      const serialized = serializeCulvertGroups(parsed.data)

      expect(serialized).toEqual(lines)
    })

    it("should parse and serialize back to identical data", () => {
      const lines = lineString.split("\n")
      const parsed = parseCulvertData(lines[0], lines, 0)
      const serialized = serializeCulvertGroups(parsed.data)
      const reParsed = parseCulvertData(serialized[0], serialized, 0)

      expect(reParsed.data).toEqual(parsed.data)
    })
  })
})
