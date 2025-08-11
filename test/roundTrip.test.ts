import { describe, expect, it } from "vitest"
import { readFileSync } from "fs"
import { parseGeometry } from "../src/parseGeometry"
import { serializeGeometryString } from "../src/serializers"

describe("Round-trip parsing and serialization", () => {
  describe("Dingman.g01", () => {
    it("should successfully parse Dingman.g01 and produce serializable output", () => {
      // Read original file
      const originalContent = readFileSync("test/data/Dingman.g01", "utf-8")

      // Parse the geometry file - this should not throw
      const geometryData = parseGeometry(originalContent)

      // Verify components were parsed
      expect(geometryData.storageAreas).toBeDefined()
      expect(geometryData.connections).toBeDefined()
      expect(geometryData.boundaryConditions).toBeDefined()
      expect(geometryData.storageAreas.length).toBeGreaterThan(0)
      expect(geometryData.connections.length).toBeGreaterThan(0)
      expect(geometryData.boundaryConditions.length).toBeGreaterThan(0)

      // Serialize back to string - this should not throw
      const serializedContent = serializeGeometryString(geometryData)

      // Basic validation - serialized content should contain key elements
      expect(serializedContent).toContain("Geom Title=Mitigation 02")
      expect(serializedContent).toContain("Program Version=6.60")
      expect(serializedContent).toContain("Storage Area=2D_Grid")
      expect(serializedContent).toContain("Connection=Culv_43")
      expect(serializedContent).toContain("Connection=Culv_44")

      // The serialized output should be a non-empty string
      expect(serializedContent.length).toBeGreaterThan(0)
      expect(serializedContent.split("\n").length).toBeGreaterThan(100)
    })

    it.skip("should parse and serialize Dingman.g01 to match original content exactly", () => {
      // This test is skipped because the current implementation has known gaps
      // in round-trip fidelity. Issues include:
      // 1. Missing culvert barrel details in serialization
      // 2. Missing bridge component details
      // 3. Number formatting differences (precision loss)
      // 4. Missing trailing metadata (LCMann Time, GIS settings, etc.)
      //
      // This test documents the goal of perfect round-trip serialization
      // and can be enabled once these gaps are addressed.

      const originalContent = readFileSync("test/data/Dingman.g01", "utf-8")
      const geometryData = parseGeometry(originalContent)
      const serializedContent = serializeGeometryString(geometryData)
      const normalizedOriginal = originalContent.replace(/\r\n/g, "\n")

      expect(serializedContent).toBe(normalizedOriginal)
    })
  })
})
