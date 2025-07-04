import type { StorageArea } from "./storageArea"
import type { Connection } from "./connection"
import type { BoundaryCondition } from "./boundaryCondition"

export interface ViewingRectangle {
  left: number
  right: number // HEC-RAS often uses Y2 here (bottom)
  top: number
  bottom: number // HEC-RAS often uses Y1 here (top)
}

export interface HECRASGeometry {
  geomTitle: string // "Geom Title="
  programVersion: string // "Program Version"
  viewingRectangle: ViewingRectangle // "Viewing Rectangle="
  description?: string
  storageAreas: StorageArea[]
  connections: Connection[]
  boundaryConditions: BoundaryCondition[]
  rasterPath?: string
  units?: string
  dtmType?: string
  dtmPath?: string
  streamLayer?: string
  xsCutLineLayer?: string
  projection?: string
  datum?: string
}
