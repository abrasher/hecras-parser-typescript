// models/storageArea.ts
import type { Coordinate, VolumeElevationPoint } from "./common"

export class StorageArea {
  id: number
  centroid: Coordinate | null = null
  surfaceLine: Coordinate[] = []
  volumeElevationData: VolumeElevationPoint[] = []
  manningsN: number | null = null
  // type: number (1 for elevation-volume usually)

  constructor(id: number, centroidX?: number, centroidY?: number) {
    this.id = id
    if (centroidX !== undefined && centroidY !== undefined) {
      this.centroid = { x: centroidX, y: centroidY }
    }
  }
}
