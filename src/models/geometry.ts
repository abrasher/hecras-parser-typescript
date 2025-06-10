// models/geometry.ts
import type { StorageArea } from "./storageArea"
import type { Connection } from "./connection"
import type { Reach } from "./reach"

export interface ViewingRectangle {
  left: number
  right: number // HEC-RAS often uses Y2 here (bottom)
  top: number
  bottom: number // HEC-RAS often uses Y1 here (top)
}
export interface GisInfo {
  rasterPath?: string
  units?: string
  dtmType?: string
  dtmPath?: string
  streamLayer?: string
  xsCutLineLayer?: string
  projection?: string
  datum?: string
  [key: string]: any // For other GIS properties
}

export class HECRASGeometry {
  "Geom Title": string | null = null
  "Program Version": string | null = null
  "Viewing Rectangle": ViewingRectangle | null = null
  reaches: Reach[] = []
  storageAreas: StorageArea[] = []
  connections: Connection[] = []
  gisInfo: GisInfo = {}
}
