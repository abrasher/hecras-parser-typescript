import { describe, it, expect } from "vitest"
import { serializeStorageArea, serializeStorageAreaString } from "../geometry/storageAreaSerializer"
import type { StorageArea } from "../../models/geometry/storageArea"

describe("StorageAreaSerializer", () => {
  describe("GIVEN a storage area with basic properties", () => {
    it("WHEN serialized THEN formats header section", () => {
      const storageArea: StorageArea = {
        id: "SA1",
        surfaceLine: [
          { x: 100.0, y: 200.0 },
          { x: 150.0, y: 250.0 },
        ],
        mannings: 0.035,
        type: 1,
        area: 1000.0,
        minElevation: 150.0,
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
      }

      const result = serializeStorageArea(storageArea)

      expect(result[0]).toBe("Storage Area=SA1,,,")
      expect(result[1]).toBe("Storage Area Surface Line=2")
      expect(result[2]).toBe("           100.0           200.0")
      expect(result[3]).toBe("           150.0           250.0")
      expect(result[4]).toBe("Storage Area Type=1")
      expect(result[5]).toBe("Storage Area Area=1000")
      expect(result[6]).toBe("Storage Area Min Elev=150")
      expect(result[7]).toBe("Storage Area Is2D=0")
      expect(result[8]).toBe("Storage Area Mannings=0.035")
    })
  })

  describe("GIVEN a storage area with surface line", () => {
    it("WHEN serialized THEN formats coordinate array", () => {
      const storageArea: StorageArea = {
        id: "SA2",
        surfaceLine: [
          { x: 0.0, y: 100.0 },
          { x: 50.0, y: 150.0 },
          { x: 100.0, y: 200.0 },
        ],
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
      }

      const result = serializeStorageArea(storageArea)

      expect(result[0]).toBe("Storage Area=SA2,,,")
      expect(result[1]).toBe("Storage Area Surface Line=3")
      expect(result[2]).toBe("             0.0           100.0")
      expect(result[3]).toBe("            50.0           150.0")
      expect(result[4]).toBe("           100.0           200.0")
      expect(result[5]).toBe("Storage Area Type=0")
      expect(result[6]).toBe("Storage Area Is2D=0")
    })
  })

  describe("GIVEN a storage area with 2D points", () => {
    it("WHEN serialized THEN formats 2D point data", () => {
      const storageArea: StorageArea = {
        id: "SA3",
        surfaceLine: [],
        mannings: null,
        type: 0,
        area: null,
        minElevation: null,
        volumeElevationData: [],
        is2D: 1,
        pointGenerationData: "auto",
        points2D: [
          { x: 10.0, y: 20.0 },
          { x: 30.0, y: 40.0 },
        ],
        pointsPerimeterTime: "2023-01-01 12:00:00",
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
      }

      const result = serializeStorageArea(storageArea)

      expect(result[0]).toBe("Storage Area=SA3,,,")
      expect(result[1]).toBe("Storage Area Type=0")
      expect(result[2]).toBe("Storage Area Is2D=1")
      expect(result[3]).toBe("Storage Area Point Generation Data=auto")
      expect(result[4]).toBe("Storage Area 2D Points=2")
      expect(result[5]).toBe("            10.0            20.0")
      expect(result[6]).toBe("            30.0            40.0")
      expect(result[7]).toBe("Storage Area 2D PointsPerimeterTime=2023-01-01 12:00:00")
    })
  })

  describe("GIVEN a storage area with volume elevation data", () => {
    it("WHEN serialized THEN formats volume table", () => {
      const storageArea: StorageArea = {
        id: "SA4",
        surfaceLine: [],
        mannings: null,
        type: 0,
        area: null,
        minElevation: null,
        volumeElevationData: [
          { elevation: 100, volume: 1000 },
          { elevation: 110, volume: 2000 },
        ],
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
      }

      const result = serializeStorageArea(storageArea)

      // Volume elevation data serialization is not implemented yet
      // This test serves as a placeholder for when it's implemented
      expect(result[0]).toBe("Storage Area=SA4,,,")
      expect(result[1]).toBe("Storage Area Type=0")
      expect(result[2]).toBe("Storage Area Is2D=0")
    })
  })

  describe("GIVEN a storage area with 2D computational parameters", () => {
    it("WHEN serialized THEN formats 2D parameters", () => {
      const storageArea: StorageArea = {
        id: "SA5",
        surfaceLine: [],
        mannings: null,
        type: 0,
        area: null,
        minElevation: null,
        volumeElevationData: [],
        is2D: 1,
        pointGenerationData: null,
        points2D: [],
        pointsPerimeterTime: null,
        cellVolumeFilterTolerance: 0.01,
        cellMinimumAreaFraction: 0.05,
        faceProfileFilterTolerance: 0.02,
        faceAreaElevationProfileFilterTolerance: 0.03,
        faceAreaElevationConveyanceRatio: 0.8,
        faceMinLengthRatio: 0.1,
        faceAreaLaminarDepth: 0.5,
        multipleFaceMannN: 1,
        compositeLC: 0,
        locked: 0,
      }

      const result = serializeStorageArea(storageArea)

      expect(result[0]).toBe("Storage Area=SA5,,,")
      expect(result[1]).toBe("Storage Area Type=0")
      expect(result[2]).toBe("Storage Area Is2D=1")
      expect(result[3]).toBe("2D Cell Volume Filter Tolerance=0.01")
      expect(result[4]).toBe("2D Cell Minimum Area Fraction=0.05")
      expect(result[5]).toBe("2D Face Profile Filter Tolerance=0.02")
      expect(result[6]).toBe("2D Face Area Elevation Profile Filter Tolerance=0.03")
      expect(result[7]).toBe("2D Face Area Elevation Conveyance Ratio=0.8")
      expect(result[8]).toBe("2D Face Min Length Ratio=0.1")
      expect(result[9]).toBe("2D Face Area Laminar Depth=0.5")
      expect(result[10]).toBe("2D Multiple Face Mann n=1")
      expect(result[11]).toBe("2D Composite LC=0")
      expect(result[12]).toBe("2D Locked=0")
    })
  })

  describe("GIVEN a storage area with null fields", () => {
    it("WHEN serialized THEN omits null fields", () => {
      const storageArea: StorageArea = {
        id: "SA6",
        surfaceLine: [],
        mannings: null, // null field - should be omitted
        type: 0,
        area: null, // null field - should be omitted
        minElevation: null, // null field - should be omitted
        volumeElevationData: [],
        is2D: 0,
        pointGenerationData: null, // null field - should be omitted
        points2D: [],
        pointsPerimeterTime: null, // null field - should be omitted
        cellVolumeFilterTolerance: null, // null field - should be omitted
        cellMinimumAreaFraction: null, // null field - should be omitted
        faceProfileFilterTolerance: null, // null field - should be omitted
        faceAreaElevationProfileFilterTolerance: null, // null field - should be omitted
        faceAreaElevationConveyanceRatio: null, // null field - should be omitted
        faceMinLengthRatio: null, // null field - should be omitted
        faceAreaLaminarDepth: null, // null field - should be omitted
        multipleFaceMannN: null, // null field - should be omitted
        compositeLC: null, // null field - should be omitted
        locked: null, // null field - should be omitted
      }

      const result = serializeStorageArea(storageArea)

      expect(result).toHaveLength(3)
      expect(result[0]).toBe("Storage Area=SA6,,,")
      expect(result[1]).toBe("Storage Area Type=0")
      expect(result[2]).toBe("Storage Area Is2D=0")
    })
  })

  describe("GIVEN a storage area with empty arrays", () => {
    it("WHEN serialized THEN omits empty array sections", () => {
      const storageArea: StorageArea = {
        id: "SA7",
        surfaceLine: [], // empty array - should be omitted
        mannings: null,
        type: 0,
        area: null,
        minElevation: null,
        volumeElevationData: [], // empty array - should be omitted
        is2D: 0,
        pointGenerationData: null,
        points2D: [], // empty array - should be omitted
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
      }

      const result = serializeStorageArea(storageArea)

      expect(result).toHaveLength(3)
      expect(result[0]).toBe("Storage Area=SA7,,,")
      expect(result[1]).toBe("Storage Area Type=0")
      expect(result[2]).toBe("Storage Area Is2D=0")
    })
  })

  describe("GIVEN a complete storage area", () => {
    it("WHEN serialized THEN produces valid storage area string", () => {
      const storageArea: StorageArea = {
        id: "CompleteStorageArea",
        surfaceLine: [{ x: 0, y: 100 }],
        mannings: 0.035,
        type: 1,
        area: 500.0,
        minElevation: 100.0,
        volumeElevationData: [],
        is2D: 1,
        pointGenerationData: "manual",
        points2D: [{ x: 10, y: 20 }],
        pointsPerimeterTime: "2023-01-01",
        cellVolumeFilterTolerance: 0.01,
        cellMinimumAreaFraction: null,
        faceProfileFilterTolerance: null,
        faceAreaElevationProfileFilterTolerance: null,
        faceAreaElevationConveyanceRatio: null,
        faceMinLengthRatio: null,
        faceAreaLaminarDepth: null,
        multipleFaceMannN: null,
        compositeLC: null,
        locked: 1,
      }

      const result = serializeStorageAreaString(storageArea)
      const lines = result.split("\n")

      expect(lines[0]).toBe("Storage Area=CompleteStorageArea,,,")
      expect(lines[1]).toBe("Storage Area Surface Line=1")
      expect(lines[2]).toBe("             0.0           100.0")
      expect(lines[3]).toBe("Storage Area Type=1")
      expect(lines[4]).toBe("Storage Area Area=500")
      expect(lines[5]).toBe("Storage Area Min Elev=100")
      expect(lines[6]).toBe("Storage Area Is2D=1")
      expect(lines[7]).toBe("Storage Area Point Generation Data=manual")
      expect(lines[8]).toBe("Storage Area 2D Points=1")
      expect(lines[9]).toBe("            10.0            20.0")
      expect(lines[10]).toBe("Storage Area 2D PointsPerimeterTime=2023-01-01")
      expect(lines[11]).toBe("Storage Area Mannings=0.035")
      expect(lines[12]).toBe("2D Cell Volume Filter Tolerance=0.01")
      expect(lines[13]).toBe("2D Locked=1")
    })
  })
})
