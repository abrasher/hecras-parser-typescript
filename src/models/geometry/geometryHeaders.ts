export interface ViewingRectangle {
  left: number
  right: number // HEC-RAS often uses Y2 here (bottom)
  top: number
  bottom: number // HEC-RAS often uses Y1 here (top)
}

export class HECRASGeometry {
  geomTitle: string | null = null // "Geom Title="
  programVersion: string | null = null // "Program Version"
  viewingRectangle: ViewingRectangle | null = null // "Viewing Rectangle="
  description?: string
  // storageAreas: StorageArea[] = [] // not implemented yet
  // connections: Connection[] = [] // not implemented yet
  rasterPath?: string
  units?: string
  dtmType?: string
  dtmPath?: string
  streamLayer?: string
  xsCutLineLayer?: string
  projection?: string
  datum?: string
}
