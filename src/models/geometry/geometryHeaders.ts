import type { StorageArea } from "./storageArea"
import type { Connection } from "./connection"
import type { BoundaryCondition } from "./boundaryCondition"
import type { RiverReach } from "./riverReach"
import type { BreakLine } from "./breakLine"

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
  riverReaches: RiverReach[]
  breakLines: BreakLine[]
  rasterPath?: string
  units?: string
  dtmType?: string
  dtmPath?: string
  streamLayer?: string
  xsCutLineLayer?: string
  projection?: string
  datum?: string

  // Global settings (appear at end of file)
  lcmannTime?: string // "LCMann Time="
  lcmannRegionTime?: string // "LCMann Region Time="
  lcmannTable?: number // "LCMann Table="
  chanStopCuts?: number // "Chan Stop Cuts="
  useUserSpecifiedReachOrder?: number // "Use User Specified Reach Order="
  gisRatioCutsToInvert?: number // "GIS Ratio Cuts To Invert="
  gisLimitAtBridges?: number // "GIS Limit At Bridges="
  compositeChannelSlope?: number // "Composite Channel Slope="
}
