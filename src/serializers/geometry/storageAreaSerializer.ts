import type { StorageArea } from "../../models/geometry/storageArea"
import { formatMaybeNullorUndefined } from "../atomic"
import { coordinatePairToString } from "../utils"
import { chunk } from "es-toolkit"

/**
 * Serialize a storage area to HEC-RAS format
 * @param storageArea Storage area data
 * @returns Array of formatted lines
 */
export function serializeStorageArea(storageArea: StorageArea): string[] {
  const lines: string[] = []

  const name = storageArea.id.toString().padEnd(16, " ")
  const centroidX = formatMaybeNullorUndefined(storageArea.centroidX)
  const centroidY = formatMaybeNullorUndefined(storageArea.centroidY)

  lines.push(`Storage Area=${name},${centroidX},${centroidY}`)

  // Surface line coordinates
  lines.push(`Storage Area Surface Line= ${storageArea.surfaceLine.length} `)

  // Format surface line coordinates - each coordinate pair on its own line with 32 char width
  for (const coord of storageArea.surfaceLine) {
    const formattedCoord = coordinatePairToString(coord, 16)
    lines.push(formattedCoord.padEnd(48, " "))
  }

  // Storage Area Type
  lines.push(`Storage Area Type= ${storageArea.type} `)

  // Storage Area Area (optional)
  if (storageArea.area !== null) {
    lines.push(`Storage Area Area=${storageArea.area}`)
  } else {
    lines.push("Storage Area Area=")
  }

  // Storage Area Min Elevation (optional)
  if (storageArea.minElevation !== null) {
    lines.push(`Storage Area Min Elev=${storageArea.minElevation}`)
  } else {
    lines.push("Storage Area Min Elev=")
  }

  // Volume-Elevation data (traditional storage areas)
  if (storageArea.volumeElevationData.length > 0) {
    lines.push(`Storage Area Vol Elev= ${storageArea.volumeElevationData.length} `)

    // Format volume-elevation pairs - 5 pairs per line
    chunk(storageArea.volumeElevationData, 5).forEach((group) => {
      const formattedLine = group
        .map((ve) => {
          const elev = ve.elevation.toString().padStart(8, " ")
          const vol = ve.volume.toString().padStart(8, " ")
          return `${elev}${vol}`
        })
        .join("")
      lines.push(` ${formattedLine}`)
    })
  }

  // Is2D flag
  lines.push(`Storage Area Is2D=${storageArea.is2D}`)

  // Point Generation Data
  if (storageArea.pointGenerationData !== null) {
    lines.push(`Storage Area Point Generation Data=${storageArea.pointGenerationData}`)
  }

  // 2D Points
  lines.push(`Storage Area 2D Points= ${storageArea.points2D.length} `)

  if (storageArea.points2D.length > 0) {
    // Format 2D points - 2 coordinate pairs per line
    chunk(storageArea.points2D, 2).forEach((coordPair) => {
      const formattedLine = coordPair.map((coord) => coordinatePairToString(coord, 16)).join("")
      lines.push(formattedLine)
    })
  }

  // 2D Points Perimeter Time
  if (storageArea.pointsPerimeterTime !== null) {
    lines.push(`Storage Area 2D PointsPerimeterTime=${storageArea.pointsPerimeterTime}`)
  }

  // Manning's n value
  if (storageArea.mannings !== null) {
    lines.push(`Storage Area Mannings=${storageArea.mannings}`)
  }

  // 2D specific parameters - only include if not null
  if (storageArea.cellVolumeFilterTolerance !== null) {
    lines.push(`2D Cell Volume Filter Tolerance=${storageArea.cellVolumeFilterTolerance}`)
  }

  if (storageArea.cellMinimumAreaFraction !== null) {
    lines.push(`2D Cell Minimum Area Fraction=${storageArea.cellMinimumAreaFraction}`)
  }

  if (storageArea.faceProfileFilterTolerance !== null) {
    lines.push(`2D Face Profile Filter Tolerance=${storageArea.faceProfileFilterTolerance}`)
  }

  if (storageArea.faceAreaElevationProfileFilterTolerance !== null) {
    lines.push(
      `2D Face Area Elevation Profile Filter Tolerance=${storageArea.faceAreaElevationProfileFilterTolerance}`,
    )
  }

  if (storageArea.faceAreaElevationConveyanceRatio !== null) {
    lines.push(
      `2D Face Area Elevation Conveyance Ratio=${storageArea.faceAreaElevationConveyanceRatio}`,
    )
  }

  if (storageArea.faceMinLengthRatio !== null) {
    lines.push(`2D Face Min Length Ratio=${storageArea.faceMinLengthRatio}`)
  }

  if (storageArea.faceAreaLaminarDepth !== null) {
    lines.push(`2D Face Area Laminar Depth=${storageArea.faceAreaLaminarDepth}`)
  }

  if (storageArea.multipleFaceMannN !== null) {
    lines.push(`2D Multiple Face Mann n=${storageArea.multipleFaceMannN}`)
  }

  if (storageArea.compositeLC !== null) {
    lines.push(`2D Composite LC=${storageArea.compositeLC}`)
  }

  if (storageArea.locked !== null) {
    lines.push(`2D Locked=${storageArea.locked}`)
    // Add extra blank line after 2D Locked - these have an extra line, not sure if it is intentional or not.
    lines.push("")
  }

  return lines
}

/**
 * Serialize a storage area to a complete HEC-RAS string
 * @param storageArea Storage area data
 * @returns Formatted HEC-RAS string
 */
export function serializeStorageAreaString(storageArea: StorageArea): string {
  return serializeStorageArea(storageArea).join("\n")
}
