import { coordinatesToGeoJSONPoints } from "../utils"
import type { Coordinate, VolumeElevationPoint } from "./common"

interface IStorageArea {
  id: string | number
  centroid: { x: number; y: number }
  surfaceLine: Coordinate[]
  mannings: number | null
  type: number
  area: number | null
  minElevation: number | null
  volumeElevationData: VolumeElevationPoint[]
  is2D: number // 0 or 1
}

export class StorageArea {
  id: string | number
  centroid: Coordinate | null = null
  surfaceLine: Coordinate[] = []
  volumeElevationData: VolumeElevationPoint[] = []
  mannings: number | null = null
  type: number = 1
  area: number | null = null
  minElevation: number | null = null
  is2D: number = 0 // 0 or 1

  constructor(id: string | number, centroidX?: number, centroidY?: number) {
    this.id = id
    if (centroidX !== undefined && centroidY !== undefined) {
      this.centroid = { x: centroidX, y: centroidY }
    }
  }

  toGeoJSON(): GeoJSON.Feature<GeoJSON.Polygon> {
    return {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [coordinatesToGeoJSONPoints(this.surfaceLine)],
      },
      properties: {
        id: this.id,
        mannings: this.mannings,
        type: this.type,
        area: this.area,
        minElevation: this.minElevation,
      },
    }
  }
}
