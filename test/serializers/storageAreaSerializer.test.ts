import { describe, expect, it } from "vitest"
import type { StorageArea } from "../../src/models/geometry/storageArea"
import {
  serializeStorageArea,
  serializeStorageAreaString,
} from "../../src/serializers/geometry/storageAreaSerializer"

describe("StorageAreaSerializer", () => {
  describe("2D Storage Area (Dingman.g01)", () => {
    const testStorageArea2D: StorageArea = {
      id: "2D_Grid",
      centroidX: null,
      centroidY: null,
      surfaceLine: [
        [483730.859031855, 4751219.0960161],
        [483740.754888181, 4751244.70882071],
        [483745.067773888, 4751268.34428934],
        [483748.658764606, 4751291.68572901],
        [483752.221527827, 4751314.88153067],
        [483752.848562137, 4751339.96290305],
      ],
      mannings: 0.06,
      type: 1,
      area: null,
      minElevation: null,
      volumeElevationData: [],
      is2D: -1,
      pointGenerationData: ",,25,25",
      points2D: [
        [483813.429222745, 4751366.80032096],
        [483751.590595473, 4751168.36503865],
        [483809.196962913, 4751312.72041876],
        [483744.084984306, 4751228.70409084],
        [483290.107524941, 4751088.9441675],
        [483723.39188456, 4751138.7829585],
        [483725.378001649, 4751126.1986775],
        [483362.71138705, 4750999.01840593],
      ],
      pointsPerimeterTime: "21May2025 13:18:09",
      cellVolumeFilterTolerance: 0.01,
      cellMinimumAreaFraction: 0.01,
      faceProfileFilterTolerance: 0.01,
      faceAreaElevationProfileFilterTolerance: 0.01,
      faceAreaElevationConveyanceRatio: 0.02,
      faceMinLengthRatio: 0.05,
      faceAreaLaminarDepth: 0.2,
      multipleFaceMannN: 0,
      compositeLC: 0,
      locked: -1,
    }

    const expected2DOutput = [
      "Storage Area=2D_Grid         ,,",
      "Storage Area Surface Line= 6 ",
      "483730.859031855 4751219.0960161                ",
      "483740.7548881814751244.70882071                ",
      "483745.0677738884751268.34428934                ",
      "483748.6587646064751291.68572901                ",
      "483752.2215278274751314.88153067                ",
      "483752.8485621374751339.96290305                ",
      "Storage Area Type= 1 ",
      "Storage Area Area=",
      "Storage Area Min Elev=",
      "Storage Area Is2D=-1",
      "Storage Area Point Generation Data=,,25,25",
      "Storage Area 2D Points= 8 ",
      "483813.4292227454751366.80032096483751.5905954734751168.36503865",
      "483809.1969629134751312.72041876483744.0849843064751228.70409084",
      "483290.107524941 4751088.9441675 483723.39188456 4751138.7829585",
      "483725.378001649 4751126.1986775 483362.711387054750999.01840593",
      "Storage Area 2D PointsPerimeterTime=21May2025 13:18:09",
      "Storage Area Mannings=0.06",
      "2D Cell Volume Filter Tolerance=0.01",
      "2D Cell Minimum Area Fraction=0.01",
      "2D Face Profile Filter Tolerance=0.01",
      "2D Face Area Elevation Profile Filter Tolerance=0.01",
      "2D Face Area Elevation Conveyance Ratio=0.02",
      "2D Face Min Length Ratio=0.05",
      "2D Face Area Laminar Depth=0.2",
      "2D Multiple Face Mann n=0",
      "2D Composite LC=0",
      "2D Locked=-1",
    ]

    it("should serialize 2D storage area to array", () => {
      const result = serializeStorageArea(testStorageArea2D)
      expect(result).toEqual(expected2DOutput)
    })

    it("should serialize 2D storage area to string", () => {
      const result = serializeStorageAreaString(testStorageArea2D)
      expect(result).toBe(expected2DOutput.join("\n"))
    })
  })
})
