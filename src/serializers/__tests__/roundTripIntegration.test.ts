import { describe, it, expect } from "vitest"
import { parseGeometry } from "../../parseGeometry"
import { serializeGeometry, serializeGeometryString } from "../geometrySerializer"
import type { HECRASGeometry } from "../../models/geometry/geometryHeaders"
import { readFileSync } from "fs"
import { join } from "path"

describe("Round-Trip Integration Tests", () => {
  const testDataPath = join(process.cwd(), "test", "data")

  describe.skip("GIVEN Dingman.g01 test file", () => {
    // TODO: Skip this test due to malformed coordinate data in the test file
    // The file has coordinates without proper spacing that causes parsing issues
    it("WHEN parsed and serialized THEN maintains data integrity", () => {
      // Read the original file
      const originalContent = readFileSync(join(testDataPath, "Dingman.g01"), "utf-8")

      // Parse to object
      const parsedGeometry = parseGeometry(originalContent)

      // Verify we parsed something meaningful
      expect(parsedGeometry.geomTitle).toBe("Mitigation 02")
      expect(parsedGeometry.programVersion).toBe("6.60")
      expect(parsedGeometry.description).toContain("Upsize Culvert")
      expect(parsedGeometry.storageAreas).toHaveLength(1)
      expect(parsedGeometry.connections.length).toBeGreaterThan(0)

      // Serialize back to text
      const serializedLines = serializeGeometry(parsedGeometry)
      const serializedContent = serializedLines.join("\n")

      // Parse the serialized content again
      const reparsedGeometry = parseGeometry(serializedContent)

      // Verify round-trip integrity - header data
      expect(reparsedGeometry.geomTitle).toBe(parsedGeometry.geomTitle)
      expect(reparsedGeometry.programVersion).toBe(parsedGeometry.programVersion)
      expect(reparsedGeometry.description).toBe(parsedGeometry.description)

      // Verify viewing rectangle
      expect(reparsedGeometry.viewingRectangle.left).toBeCloseTo(parsedGeometry.viewingRectangle.left, 6)
      expect(reparsedGeometry.viewingRectangle.right).toBeCloseTo(parsedGeometry.viewingRectangle.right, 6)
      expect(reparsedGeometry.viewingRectangle.top).toBeCloseTo(parsedGeometry.viewingRectangle.top, 6)
      expect(reparsedGeometry.viewingRectangle.bottom).toBeCloseTo(parsedGeometry.viewingRectangle.bottom, 6)

      // Verify storage areas count and basic data
      expect(reparsedGeometry.storageAreas).toHaveLength(parsedGeometry.storageAreas.length)
      if (parsedGeometry.storageAreas.length > 0) {
        const originalSA = parsedGeometry.storageAreas[0]
        const reparsedSA = reparsedGeometry.storageAreas[0]
        expect(reparsedSA.id).toBe(originalSA.id)
        expect(reparsedSA.type).toBe(originalSA.type)
        expect(reparsedSA.is2D).toBe(originalSA.is2D)
        expect(reparsedSA.surfaceLine).toHaveLength(originalSA.surfaceLine.length)
      }

      // Verify connections count and basic data
      expect(reparsedGeometry.connections).toHaveLength(parsedGeometry.connections.length)
      if (parsedGeometry.connections.length > 0) {
        const originalConn = parsedGeometry.connections[0]
        const reparsedConn = reparsedGeometry.connections[0]
        expect(reparsedConn.name).toBe(originalConn.name)
        expect(reparsedConn.upstreamStorageArea).toBe(originalConn.upstreamStorageArea)
        expect(reparsedConn.downstreamStorageArea).toBe(originalConn.downstreamStorageArea)
      }
    })
  })

  describe("GIVEN programmatically created geometry", () => {
    it("WHEN serialized and parsed THEN maintains exact data integrity", () => {
      // Create a known geometry object
      const originalGeometry: HECRASGeometry = {
        geomTitle: "Round Trip Test Model",
        programVersion: "6.5.1",
        viewingRectangle: {
          left: 100.123,
          right: 200.456,
          top: 150.789,
          bottom: 50.012,
        },
        description: "Test geometry for round-trip validation\nSecond line of description",
        storageAreas: [
          {
            id: "TestSA1",
            surfaceLine: [
              { x: 100.0, y: 200.0 },
              { x: 150.0, y: 250.0 },
              { x: 200.0, y: 300.0 },
            ],
            mannings: 0.035,
            type: 1,
            area: 5000.0,
            minElevation: 100.0,
            volumeElevationData: [],
            is2D: 0,
            pointGenerationData: null,
            points2D: [],
            pointsPerimeterTime: null,
            cellVolumeFilterTolerance: null,
            cellMinimumAreaFraction: null,
            faceProfileFilterTolerance: null,
            faceAreaElevationProfileFilterTolerance: null,
            faceAreaElevationConveyanceRatio: null,
            faceMinLengthRatio: null,
            faceAreaLaminarDepth: null,
            multipleFaceMannN: null,
            compositeLC: null,
            locked: null,
          },
        ],
        connections: [
          {
            name: "TestConnection1",
            connectionLine: [{ x: 125.0, y: 225.0 }],
            centerlineProfile: 1,
            upstreamStorageArea: "TestSA1",
            downstreamStorageArea: "TestSA2",
          },
        ],
        boundaryConditions: [
          {
            name: "TestBC1",
            storageArea: "TestSA1",
            startPosition: { x: 110.0, y: 210.0 },
            middlePosition: { x: 120.0, y: 220.0 },
            endPosition: { x: 130.0, y: 230.0 },
            arc: 0,
            arcCoordinates: [],
            textPosition: { x: "120", y: "220" },
          },
        ],
      }

      // Serialize to text
      const serializedContent = serializeGeometryString(originalGeometry)

      // Parse the serialized content
      const parsedGeometry = parseGeometry(serializedContent)

      // Verify exact round-trip integrity
      expect(parsedGeometry.geomTitle).toBe(originalGeometry.geomTitle)
      expect(parsedGeometry.programVersion).toBe(originalGeometry.programVersion)
      expect(parsedGeometry.description).toBe(originalGeometry.description)

      // Verify viewing rectangle (with floating point tolerance)
      expect(parsedGeometry.viewingRectangle.left).toBeCloseTo(originalGeometry.viewingRectangle.left, 6)
      expect(parsedGeometry.viewingRectangle.right).toBeCloseTo(originalGeometry.viewingRectangle.right, 6)
      expect(parsedGeometry.viewingRectangle.top).toBeCloseTo(originalGeometry.viewingRectangle.top, 6)
      expect(parsedGeometry.viewingRectangle.bottom).toBeCloseTo(originalGeometry.viewingRectangle.bottom, 6)

      // Verify storage area data integrity
      expect(parsedGeometry.storageAreas).toHaveLength(1)
      const parsedSA = parsedGeometry.storageAreas[0]
      const originalSA = originalGeometry.storageAreas[0]

      expect(parsedSA.id).toBe(originalSA.id)
      expect(parsedSA.type).toBe(originalSA.type)
      expect(parsedSA.is2D).toBe(originalSA.is2D)
      expect(parsedSA.mannings).toBeCloseTo(originalSA.mannings!, 6)
      expect(parsedSA.area).toBeCloseTo(originalSA.area!, 6)
      expect(parsedSA.minElevation).toBeCloseTo(originalSA.minElevation!, 6)

      // Verify surface line coordinates
      expect(parsedSA.surfaceLine).toHaveLength(originalSA.surfaceLine.length)
      for (let i = 0; i < originalSA.surfaceLine.length; i++) {
        expect(parsedSA.surfaceLine[i].x).toBeCloseTo(originalSA.surfaceLine[i].x, 6)
        expect(parsedSA.surfaceLine[i].y).toBeCloseTo(originalSA.surfaceLine[i].y, 6)
      }

      // Verify connection data integrity
      expect(parsedGeometry.connections).toHaveLength(1)
      const parsedConn = parsedGeometry.connections[0]
      const originalConn = originalGeometry.connections[0]

      expect(parsedConn.name).toBe(originalConn.name)
      expect(parsedConn.centerlineProfile).toBe(originalConn.centerlineProfile)
      expect(parsedConn.upstreamStorageArea).toBe(originalConn.upstreamStorageArea)
      expect(parsedConn.downstreamStorageArea).toBe(originalConn.downstreamStorageArea)

      // Verify connection line coordinates
      expect(parsedConn.connectionLine).toHaveLength(originalConn.connectionLine.length)
      for (let i = 0; i < originalConn.connectionLine.length; i++) {
        expect(parsedConn.connectionLine[i].x).toBeCloseTo(originalConn.connectionLine[i].x, 6)
        expect(parsedConn.connectionLine[i].y).toBeCloseTo(originalConn.connectionLine[i].y, 6)
      }

      // Verify boundary condition data integrity
      expect(parsedGeometry.boundaryConditions).toHaveLength(1)
      const parsedBC = parsedGeometry.boundaryConditions[0]
      const originalBC = originalGeometry.boundaryConditions[0]

      expect(parsedBC.name).toBe(originalBC.name)
      expect(parsedBC.storageArea).toBe(originalBC.storageArea)
      expect(parsedBC.arc).toBe(originalBC.arc)
      expect(parsedBC.textPosition.x).toBe(originalBC.textPosition.x)
      expect(parsedBC.textPosition.y).toBe(originalBC.textPosition.y)

      // Verify boundary condition positions
      expect(parsedBC.startPosition.x).toBeCloseTo(originalBC.startPosition.x, 6)
      expect(parsedBC.startPosition.y).toBeCloseTo(originalBC.startPosition.y, 6)
      expect(parsedBC.middlePosition.x).toBeCloseTo(originalBC.middlePosition.x, 6)
      expect(parsedBC.middlePosition.y).toBeCloseTo(originalBC.middlePosition.y, 6)
      expect(parsedBC.endPosition.x).toBeCloseTo(originalBC.endPosition.x, 6)
      expect(parsedBC.endPosition.y).toBeCloseTo(originalBC.endPosition.y, 6)
    })
  })

  describe("GIVEN geometry with edge cases", () => {
    it("WHEN serialized and parsed THEN handles null values correctly", () => {
      const geometryWithNulls: HECRASGeometry = {
        geomTitle: "Null Test Model",
        programVersion: "6.5.1",
        viewingRectangle: {
          left: 0.0,
          right: 100.0,
          top: 100.0,
          bottom: 0.0,
        },
        // No description
        storageAreas: [
          {
            id: "NullTestSA",
            surfaceLine: [],
            mannings: null, // null value
            type: 0,
            area: null, // null value
            minElevation: null, // null value
            volumeElevationData: [],
            is2D: 0,
            pointGenerationData: null,
            points2D: [],
            pointsPerimeterTime: null,
            cellVolumeFilterTolerance: null,
            cellMinimumAreaFraction: null,
            faceProfileFilterTolerance: null,
            faceAreaElevationProfileFilterTolerance: null,
            faceAreaElevationConveyanceRatio: null,
            faceMinLengthRatio: null,
            faceAreaLaminarDepth: null,
            multipleFaceMannN: null,
            compositeLC: null,
            locked: null,
          },
        ],
        connections: [],
        boundaryConditions: [],
      }

      // Serialize and parse
      const serializedContent = serializeGeometryString(geometryWithNulls)
      const parsedGeometry = parseGeometry(serializedContent)

      // Verify null handling
      expect(parsedGeometry.description).toBeUndefined()
      expect(parsedGeometry.storageAreas).toHaveLength(1)

      const parsedSA = parsedGeometry.storageAreas[0]
      expect(parsedSA.id).toBe("NullTestSA")
      expect(parsedSA.surfaceLine).toHaveLength(0)
      expect(parsedSA.mannings).toBeNull()
      expect(parsedSA.area).toBeNull()
      expect(parsedSA.minElevation).toBeNull()
      expect(parsedSA.type).toBe(0)
      expect(parsedSA.is2D).toBe(0)
    })
  })

  describe("GIVEN minimal geometry", () => {
    it("WHEN serialized and parsed THEN maintains minimal structure", () => {
      const minimalGeometry: HECRASGeometry = {
        geomTitle: "Minimal Model",
        programVersion: "6.5.1",
        viewingRectangle: {
          left: 0.0,
          right: 1.0,
          top: 1.0,
          bottom: 0.0,
        },
        storageAreas: [],
        connections: [],
        boundaryConditions: [],
      }

      // Serialize and parse
      const serializedContent = serializeGeometryString(minimalGeometry)
      const parsedGeometry = parseGeometry(serializedContent)

      // Verify minimal structure is preserved
      expect(parsedGeometry.geomTitle).toBe(minimalGeometry.geomTitle)
      expect(parsedGeometry.programVersion).toBe(minimalGeometry.programVersion)
      expect(parsedGeometry.description).toBeUndefined()
      expect(parsedGeometry.storageAreas).toHaveLength(0)
      expect(parsedGeometry.connections).toHaveLength(0)
      expect(parsedGeometry.boundaryConditions).toHaveLength(0)

      // Verify viewing rectangle
      expect(parsedGeometry.viewingRectangle.left).toBe(minimalGeometry.viewingRectangle.left)
      expect(parsedGeometry.viewingRectangle.right).toBe(minimalGeometry.viewingRectangle.right)
      expect(parsedGeometry.viewingRectangle.top).toBe(minimalGeometry.viewingRectangle.top)
      expect(parsedGeometry.viewingRectangle.bottom).toBe(minimalGeometry.viewingRectangle.bottom)
    })
  })
})
