import type { HECRASGeometry as IHECRASGeometry } from "./models/geometry/geometryHeaders"
import { serializeGeometryString } from "./serializers/geometrySerializer"

export class HECRASGeometry implements IHECRASGeometry {
  geomTitle: string
  programVersion: string
  viewingRectangle: { left: number; right: number; top: number; bottom: number }
  description?: string
  storageAreas: IHECRASGeometry["storageAreas"]
  connections: IHECRASGeometry["connections"]
  boundaryConditions: IHECRASGeometry["boundaryConditions"]
  riverReaches: IHECRASGeometry["riverReaches"]
  breakLines: IHECRASGeometry["breakLines"]
  junctions: IHECRASGeometry["junctions"]
  rasterPath?: string
  units?: string
  dtmType?: string
  dtmPath?: string
  streamLayer?: string
  xsCutLineLayer?: string
  projection?: string
  datum?: string
  lcmannTime?: string
  lcmannRegionTime?: string
  lcmannTable?: number
  chanStopCuts?: number
  useUserSpecifiedReachOrder?: number
  gisRatioCutsToInvert?: number
  gisLimitAtBridges?: number
  compositeChannelSlope?: number

  constructor(data: IHECRASGeometry) {
    this.geomTitle = data.geomTitle
    this.programVersion = data.programVersion
    this.viewingRectangle = data.viewingRectangle
    this.description = data.description
    this.storageAreas = data.storageAreas
    this.connections = data.connections
    this.boundaryConditions = data.boundaryConditions
    this.riverReaches = data.riverReaches
    this.breakLines = data.breakLines
    this.junctions = data.junctions
    this.rasterPath = data.rasterPath
    this.units = data.units
    this.dtmType = data.dtmType
    this.dtmPath = data.dtmPath
    this.streamLayer = data.streamLayer
    this.xsCutLineLayer = data.xsCutLineLayer
    this.projection = data.projection
    this.datum = data.datum
    this.lcmannTime = data.lcmannTime
    this.lcmannRegionTime = data.lcmannRegionTime
    this.lcmannTable = data.lcmannTable
    this.chanStopCuts = data.chanStopCuts
    this.useUserSpecifiedReachOrder = data.useUserSpecifiedReachOrder
    this.gisRatioCutsToInvert = data.gisRatioCutsToInvert
    this.gisLimitAtBridges = data.gisLimitAtBridges
    this.compositeChannelSlope = data.compositeChannelSlope
  }

  /**
   * Convert the geometry back to HEC-RAS file format
   * @returns The geometry as a HEC-RAS formatted string
   */
  save(): string {
    return serializeGeometryString(this)
  }

  /**
   * Save geometry to a file (Node.js only)
   * @param filePath Path where to save the file
   */
  async saveToFile(filePath: string): Promise<void> {
    if (typeof window !== "undefined") {
      throw new Error("saveToFile is only available in Node.js environment")
    }

    try {
      const { writeFile } = await import("fs/promises")
      const content = this.save()
      await writeFile(filePath, content, "utf-8")
    } catch (error) {
      throw new Error(`Failed to save file: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Trigger a download in the browser
   * @param filename The filename for the download
   */
  download(filename: string = "geometry.g01"): void {
    if (typeof window === "undefined") {
      throw new Error("download is only available in browser environment")
    }

    const content = this.save()
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * Create a deep copy of this geometry
   * @returns A new HECRASGeometry instance with copied data
   */
  clone(): HECRASGeometry {
    return new HECRASGeometry(JSON.parse(JSON.stringify(this)))
  }
}
