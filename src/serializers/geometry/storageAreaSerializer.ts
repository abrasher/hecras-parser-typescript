// Storage area serializer for HEC-RAS format
// Reverses the storage area parsing process to produce exact format output

import type { StorageArea } from "../../models/geometry/storageArea"
import type { VolumeElevationPoint } from "../../models/geometry/common"
import { formatKeyValue, formatCoordinateLines } from "../atomic"

/**
 * Serialize storage area to HEC-RAS format
 * @param storageArea Storage area properties
 * @returns Array of formatted lines
 */
export function serializeStorageArea(storageArea: StorageArea): string[] {
  const lines: string[] = []

  // Storage Area header with ID
  lines.push(formatKeyValue("Storage Area", `${storageArea.id},,,`))

  // Surface line coordinates
  if (storageArea.surfaceLine.length > 0) {
    lines.push(formatKeyValue("Storage Area Surface Line", storageArea.surfaceLine.length))
    const coordinateLines = formatCoordinateLines(storageArea.surfaceLine)
    lines.push(...coordinateLines)
  }

  // Storage area type
  lines.push(formatKeyValue("Storage Area Type", storageArea.type))

  // Storage area area (optional)
  if (storageArea.area !== null) {
    lines.push(formatKeyValue("Storage Area Area", storageArea.area))
  }

  // Minimum elevation (optional)
  if (storageArea.minElevation !== null) {
    lines.push(formatKeyValue("Storage Area Min Elev", storageArea.minElevation))
  }

  // Volume elevation data (if present)
  if (storageArea.volumeElevationData.length > 0) {
    lines.push(...serializeVolumeElevationData(storageArea.volumeElevationData))
  }

  // 2D properties
  lines.push(formatKeyValue("Storage Area Is2D", storageArea.is2D))

  // Point generation data (optional)
  if (storageArea.pointGenerationData !== null) {
    lines.push(formatKeyValue("Storage Area Point Generation Data", storageArea.pointGenerationData))
  }

  // 2D points
  if (storageArea.points2D.length > 0) {
    lines.push(formatKeyValue("Storage Area 2D Points", storageArea.points2D.length))
    const coordinateLines = formatCoordinateLines(storageArea.points2D)
    lines.push(...coordinateLines)
  }

  // 2D points perimeter time (optional)
  if (storageArea.pointsPerimeterTime !== null) {
    lines.push(formatKeyValue("Storage Area 2D PointsPerimeterTime", storageArea.pointsPerimeterTime))
  }

  // Manning's coefficient (optional)
  if (storageArea.mannings !== null) {
    lines.push(formatKeyValue("Storage Area Mannings", storageArea.mannings))
  }

  // 2D computational parameters (all optional)
  if (storageArea.cellVolumeFilterTolerance !== null) {
    lines.push(formatKeyValue("2D Cell Volume Filter Tolerance", storageArea.cellVolumeFilterTolerance))
  }

  if (storageArea.cellMinimumAreaFraction !== null) {
    lines.push(formatKeyValue("2D Cell Minimum Area Fraction", storageArea.cellMinimumAreaFraction))
  }

  if (storageArea.faceProfileFilterTolerance !== null) {
    lines.push(formatKeyValue("2D Face Profile Filter Tolerance", storageArea.faceProfileFilterTolerance))
  }

  if (storageArea.faceAreaElevationProfileFilterTolerance !== null) {
    lines.push(
      formatKeyValue(
        "2D Face Area Elevation Profile Filter Tolerance",
        storageArea.faceAreaElevationProfileFilterTolerance,
      ),
    )
  }

  if (storageArea.faceAreaElevationConveyanceRatio !== null) {
    lines.push(formatKeyValue("2D Face Area Elevation Conveyance Ratio", storageArea.faceAreaElevationConveyanceRatio))
  }

  if (storageArea.faceMinLengthRatio !== null) {
    lines.push(formatKeyValue("2D Face Min Length Ratio", storageArea.faceMinLengthRatio))
  }

  if (storageArea.faceAreaLaminarDepth !== null) {
    lines.push(formatKeyValue("2D Face Area Laminar Depth", storageArea.faceAreaLaminarDepth))
  }

  if (storageArea.multipleFaceMannN !== null) {
    lines.push(formatKeyValue("2D Multiple Face Mann n", storageArea.multipleFaceMannN))
  }

  if (storageArea.compositeLC !== null) {
    lines.push(formatKeyValue("2D Composite LC", storageArea.compositeLC))
  }

  if (storageArea.locked !== null) {
    lines.push(formatKeyValue("2D Locked", storageArea.locked))
  }

  return lines
}

/**
 * Serialize volume elevation data (if present)
 * Note: This format is not fully defined in the parser, so this is a placeholder
 */
function serializeVolumeElevationData(_volumeData: VolumeElevationPoint[]): string[] {
  const lines: string[] = []

  // This would need to be implemented based on the actual HEC-RAS format
  // for volume elevation data, which is not currently parsed

  return lines
}

/**
 * Serialize a storage area to a complete HEC-RAS string
 * @param storageArea Storage area properties
 * @returns Formatted HEC-RAS string
 */
export function serializeStorageAreaString(storageArea: StorageArea): string {
  return serializeStorageArea(storageArea).join("\n")
}
