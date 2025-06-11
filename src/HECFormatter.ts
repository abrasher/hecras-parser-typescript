// HECFormatter.ts
import { HECRASGeometry } from "./models/geometry"
import { Reach } from "./models/reach"
import { CrossSection } from "./models/crossSection"
import {
  formatCoordinatesToString,
  formatStaElevToString,
  formatNumber,
  formatManningSegmentsToString,
} from "./utils"
import { LateralStructure } from "./models/lateralStructure"
import { StorageArea } from "./models/storageArea"
import { SAConnection } from "./models/connection"

export class HECFormatter {
  private geometry: HECRASGeometry

  constructor(geometry: HECRASGeometry) {
    this.geometry = geometry
  }

  public format(): string {
    let output: string[] = []

    this.formatHeader(output)

    this.geometry.reaches.forEach((reach) => {
      this.formatReach(output, reach)
    })

    this.geometry.storageAreas.forEach((sa) => {
      this.formatStorageArea(output, sa)
    })

    this.geometry.connections.forEach((conn) => {
      this.formatConnection(output, conn)
    })

    // Final GIS Info if available
    this.formatGisInfo(output)

    return output.join("\n")
  }

  private formatHeader(output: string[]): void {
    if (this.geometry["Geom Title"]) {
      output.push(`Geom Title=${this.geometry["Geom Title"]}`)
    }
    if (this.geometry["Program Version"]) {
      output.push(`Program Version=${this.geometry["Program Version"]}`)
    }
    const vr = this.geometry["Viewing Rectangle"]
    if (vr) {
      output.push(
        `Viewing Rectangle=${formatNumber(vr.left, 2)},${formatNumber(vr.top, 2)},${formatNumber(vr.right, 2)},${formatNumber(vr.bottom, 2)}`,
      )
    }
  }

  private formatGisInfo(output: string[]): void {
    const gis = this.geometry.gisInfo
    if (gis.rasterPath) output.push(`Geom Raster=${gis.rasterPath}`)
    // ... format other GIS properties in the correct order
  }

  private formatReach(output: string[], reach: Reach): void {
    output.push(`River Reach=${reach.riverName},${reach.reachName}`)

    if (reach.centerline.length > 0) {
      output.push(`Reach XY=${reach.centerline.length}`)
      output.push(...formatCoordinatesToString(reach.centerline))
    }

    if (reach.textPosition) {
      output.push(
        `Rch Text X Y=${formatNumber(reach.textPosition.x, 2)},${formatNumber(reach.textPosition.y, 2)}`,
      )
    }

    // ... format other reach properties (e.g., text position)

    reach.crossSections.forEach((xs) => {
      this.formatCrossSection(output, xs)
    })

    reach.lateralStructures.forEach((ls) => {
      this.formatLateralStructure(output, ls)
    })
  }

  private formatCrossSection(output: string[], xs: CrossSection): void {
    output.push(
      `Type RM Length L Ch R =1,${formatNumber(xs.riverMile, 3)},${formatNumber(xs.lengthL, 2)},${formatNumber(xs.lengthCh, 2)},${formatNumber(xs.lengthR, 2)}`,
    )

    if (xs.lastEditedTime)
      output.push(`Node Last Edited Time=${xs.lastEditedTime}`)

    if (xs.gisCutLine.length > 0) {
      output.push(`XS GIS Cut Line=${xs.gisCutLine.length}`)
      output.push(...formatCoordinatesToString(xs.gisCutLine, 5))
    }

    if (xs.staElevData.length > 0) {
      output.push(`#Sta/Elev=${xs.staElevData.length}`)
      output.push(...formatStaElevToString(xs.staElevData))
    }

    if (xs.manningSegments.length > 0) {
      output.push(
        `#Mann=${xs.manningSegments.length},0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0`,
      ) // Placeholder for counts
      output.push(...formatManningSegmentsToString(xs.manningSegments))
    }

    if (xs.bankStations?.left !== null || xs.bankStations?.right !== null) {
      output.push(
        `Bank Sta=${formatNumber(xs.bankStations.left, 2)},${formatNumber(xs.bankStations.right, 2)}`,
      )
    }

    // ... format other cross section properties (exp/contr, ineffective areas, etc.)
  }

  private formatLateralStructure(output: string[], ls: LateralStructure): void {
    output.push(
      `Type RM Length L Ch R =6,${formatNumber(ls.riverMile, 3)},,,,,`,
    ) // Type 6 for Lateral Structure
    if (ls.weirWidth) {
      output.push(`Lateral Weir WD=${formatNumber(ls.weirWidth, 2)}`)
    }
    if (ls.weirCoefficient) {
      output.push(`Lateral Weir Coef=${formatNumber(ls.weirCoefficient, 2)}`)
    }
    if (ls.stationElevationData.length > 0) {
      output.push(`Lateral Weir SE=${ls.stationElevationData.length}`)
      output.push(...formatStaElevToString(ls.stationElevationData))
    }
    // ... more LS properties
  }

  private formatStorageArea(output: string[], sa: StorageArea): void {
    output.push(
      `Storage Area=${sa.id},${formatNumber(sa.x, 2)},${formatNumber(sa.y, 2)}`,
    )
    // ... format SA properties (surface line, vol-elev, manning's)
  }

  private formatConnection(output: string[], conn: SAConnection): void {
    output.push(`Connection=${conn.id},${conn.description || ""}`)
    // ... format Connection properties
  }
}
