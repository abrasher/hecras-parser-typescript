// Culvert serializer for HEC-RAS format
// Reverses the culvert parsing process to produce exact format output

import type { CulvertGroupProperties, CulvertBarrelProperties } from "../../models/geometry/culvert"
import { formatKeyValue, formatCommaSeparated, formatStationPairLines, formatCoordinateLines } from "../atomic"

/**
 * Serialize culvert group properties to HEC-RAS format
 * @param culvertGroups Array of culvert group properties
 * @returns Array of formatted lines
 */
export function serializeCulvertGroups(culvertGroups: CulvertGroupProperties[]): string[] {
  const lines: string[] = []

  for (const group of culvertGroups) {
    lines.push(...serializeCulvertGroup(group))
  }

  return lines
}

/**
 * Serialize a single culvert group to HEC-RAS format
 * @param culvert Culvert group properties
 * @returns Array of formatted lines
 */
export function serializeCulvertGroup(culvert: CulvertGroupProperties): string[] {
  const lines: string[] = []

  // Connection Culv=shape,rise,span,length,nTop,entranceLoss,exitLoss,chart,scale,upstreamInvert,downstreamInvert,numberOfBarrels,culvertGroupName,unknownFlag,
  const culvertValues = [
    culvert.shape,
    culvert.rise,
    culvert.span,
    culvert.length,
    culvert.nTop,
    culvert.entranceLoss,
    culvert.exitLoss,
    culvert.chart,
    culvert.scale,
    culvert.upstreamInvert,
    culvert.downstreamInvert,
    culvert.numberOfBarrels,
    culvert.culvertGroupName,
    culvert.unknownFlag,
  ]

  lines.push(formatKeyValue("Connection Culv", formatCommaSeparated(culvertValues)))

  // Format barrel stations (5 pairs per line, 80 chars per line)
  if (culvert.barrelStations.length > 0) {
    const stationLines = formatStationPairLines(culvert.barrelStations)
    lines.push(...stationLines)
  }

  // Format optional properties
  if (culvert.nBottom !== undefined) {
    lines.push(formatKeyValue("Conn Culv Bottom n", culvert.nBottom))
  }

  if (culvert.nBottomDepth !== undefined) {
    lines.push(formatKeyValue("Conn Culv Bottom Depth", culvert.nBottomDepth))
  }

  if (culvert.depthBlocked !== undefined) {
    lines.push(formatKeyValue("Conn Culv Depth Blocked", culvert.depthBlocked))
  }

  // Format barrel properties
  for (const barrel of culvert.barrels) {
    lines.push(...serializeCulvertBarrel(barrel))
  }

  return lines
}

/**
 * Serialize a culvert barrel to HEC-RAS format
 * @param barrel Culvert barrel properties
 * @returns Array of formatted lines
 */
export function serializeCulvertBarrel(barrel: CulvertBarrelProperties): string[] {
  const lines: string[] = []

  // Conn Culvert Barrel=index,name,numberOfCoordinates
  const barrelValues = [barrel.index, barrel.name, barrel.coordinates.length]

  lines.push(formatKeyValue("Conn Culvert Barrel", formatCommaSeparated(barrelValues)))

  // Format coordinate lines (2 coordinates per line, 32 chars per line)
  if (barrel.coordinates.length > 0) {
    const coordinateLines = formatCoordinateLines(barrel.coordinates)
    lines.push(...coordinateLines)
  }

  return lines
}

/**
 * Serialize a single culvert group to a complete HEC-RAS string
 * @param culvert Culvert group properties
 * @returns Formatted HEC-RAS string
 */
export function serializeCulvert(culvert: CulvertGroupProperties): string {
  return serializeCulvertGroup(culvert).join("\n")
}
