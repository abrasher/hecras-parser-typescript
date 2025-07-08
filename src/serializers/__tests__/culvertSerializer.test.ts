import { describe, it, expect } from "vitest"
import { serializeCulvert, serializeCulvertGroup, serializeCulvertBarrel } from "../geometry/culvertSerializer"
import type { CulvertGroupProperties, CulvertBarrelProperties } from "../../models/geometry/culvert"
import { CULVERT_SHAPE } from "../../models/geometry/culvert"

describe("CulvertSerializer", () => {
  describe("GIVEN a culvert with basic properties", () => {
    it("WHEN serialized THEN produces valid culvert section", () => {
      const culvert: CulvertGroupProperties = {
        shape: CULVERT_SHAPE.CIRCLE,
        rise: 3.0,
        span: 3.0,
        length: 100.0,
        nTop: 0.013,
        entranceLoss: 0.5,
        exitLoss: 1.0,
        chart: 1,
        scale: 1,
        upstreamInvert: 100.0,
        downstreamInvert: 99.0,
        numberOfBarrels: 1,
        culvertGroupName: "Culvert1",
        unknownFlag: 0,
        barrelStations: [{ upstreamStation: 100.0, downstreamStation: 200.0 }],
        barrels: [],
      }

      const result = serializeCulvert(culvert)
      const lines = result.split("\n")

      expect(lines[0]).toBe("Connection Culv=1,3,3,100,0.013,0.5,1,1,1,100,99,1,Culvert1,0")
      expect(lines[1]).toBe("     100     200")
    })
  })

  describe("GIVEN a culvert with barrel stations", () => {
    it("WHEN serialized THEN formats station pairs correctly", () => {
      const culvert: CulvertGroupProperties = {
        shape: CULVERT_SHAPE.BOX,
        rise: 4.0,
        span: 6.0,
        length: 150.0,
        nTop: 0.012,
        entranceLoss: 0.5,
        exitLoss: 1.0,
        chart: 1,
        scale: 1,
        upstreamInvert: 105.0,
        downstreamInvert: 104.0,
        numberOfBarrels: 3,
        culvertGroupName: "BoxCulvert",
        unknownFlag: 0,
        barrelStations: [
          { upstreamStation: 100.0, downstreamStation: 200.0 },
          { upstreamStation: 300.0, downstreamStation: 400.0 },
          { upstreamStation: 500.0, downstreamStation: 600.0 },
        ],
        barrels: [],
      }

      const result = serializeCulvertGroup(culvert)

      expect(result[0]).toBe("Connection Culv=2,4,6,150,0.012,0.5,1,1,1,105,104,3,BoxCulvert,0")
      expect(result[1]).toBe("     100     200     300     400     500     600")
    })
  })

  describe("GIVEN a culvert with coordinates", () => {
    it("WHEN serialized THEN formats coordinate lines correctly", () => {
      const barrel: CulvertBarrelProperties = {
        index: 1,
        name: "Barrel1",
        coordinates: [
          { x: 100.0, y: 200.0 },
          { x: 150.0, y: 250.0 },
          { x: 200.0, y: 300.0 },
        ],
      }

      const result = serializeCulvertBarrel(barrel)

      expect(result[0]).toBe("Conn Culvert Barrel=1,Barrel1,3")
      expect(result[1]).toBe("           100.0           200.0")
      expect(result[2]).toBe("           150.0           250.0")
      expect(result[3]).toBe("           200.0           300.0")
    })
  })

  describe("GIVEN a culvert with undefined optional fields", () => {
    it("WHEN serialized THEN omits those lines", () => {
      const culvert: CulvertGroupProperties = {
        shape: CULVERT_SHAPE.CIRCLE,
        rise: 3.0,
        span: 3.0,
        length: 100.0,
        nTop: 0.013,
        entranceLoss: 0.5,
        exitLoss: 1.0,
        chart: 1,
        scale: 1,
        upstreamInvert: 100.0,
        downstreamInvert: 99.0,
        numberOfBarrels: 1,
        culvertGroupName: "Culvert1",
        unknownFlag: 0,
        barrelStations: [],
        barrels: [],
        // nBottom, nBottomDepth, depthBlocked are undefined
      }

      const result = serializeCulvertGroup(culvert)

      expect(result).toHaveLength(1)
      expect(result[0]).toBe("Connection Culv=1,3,3,100,0.013,0.5,1,1,1,100,99,1,Culvert1,0")
    })
  })

  describe("GIVEN a culvert with null fields", () => {
    it("WHEN serialized THEN outputs blank spacing", () => {
      // Note: Based on the current model, there are no null fields in CulvertGroupProperties
      // This test demonstrates the pattern for future use
      const barrel: CulvertBarrelProperties = {
        index: 1,
        name: "Barrel1",
        coordinates: [],
      }

      const result = serializeCulvertBarrel(barrel)

      expect(result[0]).toBe("Conn Culvert Barrel=1,Barrel1,0")
      expect(result).toHaveLength(1) // No coordinate lines since coordinates is empty
    })
  })

  describe("GIVEN a culvert with optional properties", () => {
    it("WHEN serialized THEN includes optional property lines", () => {
      const culvert: CulvertGroupProperties = {
        shape: CULVERT_SHAPE.CIRCLE,
        rise: 3.0,
        span: 3.0,
        length: 100.0,
        nTop: 0.013,
        nBottom: 0.014,
        nBottomDepth: 1.5,
        entranceLoss: 0.5,
        exitLoss: 1.0,
        chart: 1,
        scale: 1,
        upstreamInvert: 100.0,
        downstreamInvert: 99.0,
        numberOfBarrels: 1,
        culvertGroupName: "Culvert1",
        unknownFlag: 0,
        barrelStations: [],
        barrels: [],
        depthBlocked: 0.5,
      }

      const result = serializeCulvertGroup(culvert)

      expect(result).toContain("Conn Culv Bottom n=0.014")
      expect(result).toContain("Conn Culv Bottom Depth=1.5")
      expect(result).toContain("Conn Culv Depth Blocked=0.5")
    })
  })

  describe("GIVEN a culvert with multiple barrels", () => {
    it("WHEN serialized THEN formats all barrels correctly", () => {
      const culvert: CulvertGroupProperties = {
        shape: CULVERT_SHAPE.BOX,
        rise: 4.0,
        span: 6.0,
        length: 150.0,
        nTop: 0.012,
        entranceLoss: 0.5,
        exitLoss: 1.0,
        chart: 1,
        scale: 1,
        upstreamInvert: 105.0,
        downstreamInvert: 104.0,
        numberOfBarrels: 2,
        culvertGroupName: "BoxCulvert",
        unknownFlag: 0,
        barrelStations: [
          { upstreamStation: 100.0, downstreamStation: 200.0 },
          { upstreamStation: 300.0, downstreamStation: 400.0 },
        ],
        barrels: [
          {
            index: 1,
            name: "Barrel1",
            coordinates: [
              { x: 100.0, y: 200.0 },
              { x: 150.0, y: 250.0 },
            ],
          },
          {
            index: 2,
            name: "Barrel2",
            coordinates: [{ x: 200.0, y: 300.0 }],
          },
        ],
      }

      const result = serializeCulvertGroup(culvert)

      // Should have main culvert line, station line, and barrel definitions
      expect(result[0]).toBe("Connection Culv=2,4,6,150,0.012,0.5,1,1,1,105,104,2,BoxCulvert,0")
      expect(result[1]).toBe("     100     200     300     400")
      expect(result[2]).toBe("Conn Culvert Barrel=1,Barrel1,2")
      expect(result[3]).toBe("           100.0           200.0")
      expect(result[4]).toBe("           150.0           250.0")
      expect(result[5]).toBe("Conn Culvert Barrel=2,Barrel2,1")
      expect(result[6]).toBe("           200.0           300.0")
    })
  })
})
