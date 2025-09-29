import type { Coordinate } from "./common"

export interface StorageArea {
  id: string
  centroidX: number | null
  centroidY: number | null
  surfaceLine: Coordinate[]
  mannings: number | null
  type: number
  area: number | null
  minElevation: number | null
  volumeElevationData: [number, number][]
  is2D: number // 0 or 1
  pointGenerationData: string | null
  points2D: Coordinate[]
  pointsPerimeterTime: string | null
  cellVolumeFilterTolerance: number | null
  cellMinimumAreaFraction: number | null
  faceProfileFilterTolerance: number | null
  faceAreaElevationProfileFilterTolerance: number | null
  faceAreaElevationConveyanceRatio: number | null
  faceMinLengthRatio: number | null
  faceAreaLaminarDepth: number | null
  multipleFaceMannN: number | null
  compositeLC: number | null
  locked: number | null
}
