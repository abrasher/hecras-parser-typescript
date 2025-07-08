import { describe, it, expect } from "vitest"
import { serializeGeometry, serializeGeometryString } from "../geometrySerializer"
import type { HECRASGeometry } from "../../models/geometry/geometryHeaders"
import { CULVERT_SHAPE } from "../../models/geometry/culvert"

describe("GeometrySerializer", () => {
  describe("GIVEN a complete geometry object", () => {
    it("WHEN serialized THEN produces valid HEC-RAS file", () => {
      const geometry: HECRASGeometry = {
        geomTitle: "Test River Model",
        programVersion: "6.5.1",
        viewingRectangle: {
          left: 0.0,
          right: 1000.0,
          top: 500.0,
          bottom: 0.0,
        },
        description: "Test geometry for serialization",
        storageAreas: [
          {
            id: "SA1",
            surfaceLine: [
              { x: 100.0, y: 200.0 },
              { x: 200.0, y: 300.0 },
            ],
            mannings: 0.035,
            type: 1,
            area: 1000.0,
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
            name: "Connection1",
            connectionLine: [{ x: 150.0, y: 250.0 }],
            centerlineProfile: 1,
            upstreamStorageArea: "SA1",
            downstreamStorageArea: "SA2",
            culvert: [
              {
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
              },
            ],
          },
        ],
        boundaryConditions: [
          {
            name: "BC1",
            storageArea: "SA1",
            startPosition: { x: 50.0, y: 100.0 },
            middlePosition: { x: 100.0, y: 150.0 },
            endPosition: { x: 150.0, y: 200.0 },
            arc: 0,
            arcCoordinates: [],
            textPosition: { x: "100", y: "150" },
          },
        ],
      }

      const result = serializeGeometry(geometry)

      // Check header section
      expect(result[0]).toBe("Geom Title=Test River Model")
      expect(result[1]).toBe("Program Version=6.5.1")
      expect(result[2]).toBe("Viewing Rectangle=0,1000,500,0")
      expect(result[3]).toBe("BEGIN GEOM DESCRIPTION:")
      expect(result[4]).toBe("Test geometry for serialization")
      expect(result[5]).toBe("END GEOM DESCRIPTION:")

      // Check storage area section
      expect(result[6]).toBe("Storage Area=SA1,,,")
      expect(result[7]).toBe("Storage Area Surface Line=2")
      expect(result[8]).toBe("           100.0           200.0")
      expect(result[9]).toBe("           200.0           300.0")

      // Check connection section
      const connectionStartIndex = result.findIndex((line) => line.startsWith("Connection="))
      expect(result[connectionStartIndex]).toBe("Connection=Connection1")
      expect(result[connectionStartIndex + 1]).toBe("Connection Line=1")
      expect(result[connectionStartIndex + 2]).toBe("           150.0           250.0")

      // Check boundary condition section
      const bcStartIndex = result.findIndex((line) => line.startsWith("BC Line Name="))
      expect(result[bcStartIndex]).toBe("BC Line Name=BC1")
      expect(result[bcStartIndex + 1]).toBe("BC Line Storage Area=SA1")
    })
  })

  describe("GIVEN geometry with mixed component types", () => {
    it("WHEN serialized THEN maintains correct ordering", () => {
      const geometry: HECRASGeometry = {
        geomTitle: "Mixed Components",
        programVersion: "6.5.1",
        viewingRectangle: {
          left: 0.0,
          right: 100.0,
          top: 100.0,
          bottom: 0.0,
        },
        storageAreas: [
          {
            id: "SA1",
            surfaceLine: [],
            mannings: null,
            type: 0,
            area: null,
            minElevation: null,
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
          {
            id: "SA2",
            surfaceLine: [],
            mannings: null,
            type: 0,
            area: null,
            minElevation: null,
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
            name: "Conn1",
            connectionLine: [],
            centerlineProfile: 0,
            upstreamStorageArea: "SA1",
            downstreamStorageArea: "SA2",
          },
        ],
        boundaryConditions: [
          {
            name: "BC1",
            storageArea: "SA1",
            startPosition: { x: 0.0, y: 0.0 },
            middlePosition: { x: 50.0, y: 50.0 },
            endPosition: { x: 100.0, y: 100.0 },
            arc: 0,
            arcCoordinates: [],
            textPosition: { x: "50", y: "50" },
          },
          {
            name: "BC2",
            storageArea: "SA2",
            startPosition: { x: 10.0, y: 10.0 },
            middlePosition: { x: 60.0, y: 60.0 },
            endPosition: { x: 110.0, y: 110.0 },
            arc: 0,
            arcCoordinates: [],
            textPosition: { x: "60", y: "60" },
          },
        ],
      }

      const result = serializeGeometry(geometry)

      // Find section boundaries
      const sa1Index = result.findIndex((line) => line === "Storage Area=SA1,,,")
      const sa2Index = result.findIndex((line) => line === "Storage Area=SA2,,,")
      const connIndex = result.findIndex((line) => line === "Connection=Conn1")
      const bc1Index = result.findIndex((line) => line === "BC Line Name=BC1")
      const bc2Index = result.findIndex((line) => line === "BC Line Name=BC2")

      // Verify correct ordering: Header -> Storage Areas -> Connections -> Boundary Conditions
      expect(sa1Index).toBeGreaterThan(0) // After header
      expect(sa2Index).toBeGreaterThan(sa1Index) // SA2 after SA1
      expect(connIndex).toBeGreaterThan(sa2Index) // Connections after storage areas
      expect(bc1Index).toBeGreaterThan(connIndex) // Boundary conditions after connections
      expect(bc2Index).toBeGreaterThan(bc1Index) // BC2 after BC1
    })
  })

  describe("GIVEN geometry with optional sections", () => {
    it("WHEN serialized THEN handles undefined sections correctly", () => {
      const geometry: HECRASGeometry = {
        geomTitle: "Minimal Geometry",
        programVersion: "6.5.1",
        viewingRectangle: {
          left: 0.0,
          right: 10.0,
          top: 10.0,
          bottom: 0.0,
        },
        // No description
        storageAreas: [], // Empty array
        connections: [], // Empty array
        boundaryConditions: [], // Empty array
      }

      const result = serializeGeometry(geometry)

      // Should only have header section
      expect(result).toHaveLength(3)
      expect(result[0]).toBe("Geom Title=Minimal Geometry")
      expect(result[1]).toBe("Program Version=6.5.1")
      expect(result[2]).toBe("Viewing Rectangle=0,10,10,0")
    })
  })

  describe("GIVEN a complete geometry", () => {
    it("WHEN serialized as string THEN produces valid HEC-RAS content", () => {
      const geometry: HECRASGeometry = {
        geomTitle: "String Test",
        programVersion: "6.5.1",
        viewingRectangle: {
          left: 0.0,
          right: 50.0,
          top: 50.0,
          bottom: 0.0,
        },
        description: "Test for string serialization",
        storageAreas: [
          {
            id: "SA1",
            surfaceLine: [{ x: 25.0, y: 25.0 }],
            mannings: null,
            type: 0,
            area: null,
            minElevation: null,
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

      const result = serializeGeometryString(geometry)
      const lines = result.split("\n")

      expect(lines[0]).toBe("Geom Title=String Test")
      expect(lines[1]).toBe("Program Version=6.5.1")
      expect(lines[2]).toBe("Viewing Rectangle=0,50,50,0")
      expect(lines[3]).toBe("BEGIN GEOM DESCRIPTION:")
      expect(lines[4]).toBe("Test for string serialization")
      expect(lines[5]).toBe("END GEOM DESCRIPTION:")
      expect(lines[6]).toBe("Storage Area=SA1,,,")
      expect(lines[7]).toBe("Storage Area Surface Line=1")
      expect(lines[8]).toBe("            25.0            25.0")
    })
  })
})
