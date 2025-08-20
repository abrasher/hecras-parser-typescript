import type { CulvertGroupProperties, CulvertBarrelProperties } from "../../models/geometry/culvert"
import { formatStationPairs, coordinatePairToString } from "../utils"
import { chunk } from "es-toolkit"

/**
 * Serialize culvert groups to HEC-RAS format
 * @param culvertGroups Array of culvert group properties
 * @returns Array of formatted lines
 */
export function serializeCulvertGroups(culvertGroups: CulvertGroupProperties[]): string[] {
  const lines: string[] = []

  for (const culvertGroup of culvertGroups) {
    lines.push(...serializeCulvertGroup(culvertGroup))
  }

  lines.push("")

  return lines
}

/**
 * Serialize a single culvert group to HEC-RAS format
 * @param culvert Culvert group properties
 * @returns Array of formatted lines
 */
export function serializeCulvertGroup(culvert: CulvertGroupProperties): string[] {
  const lines: string[] = []

  // Main connection line with exact format from parser
  // Connection Culv=shape,rise,span,length,nTop,entranceLoss,exitLoss,chart,scale,upstreamInvert,downstreamInvert,numberOfBarrels,culvertGroupName,unknownFlag,
  const connectionLine =
    "Connection Culv=" +
    culvert.shape +
    "," +
    culvert.rise +
    "," +
    culvert.span +
    "," +
    culvert.length +
    "," +
    culvert.nTop +
    "," +
    culvert.entranceLoss +
    "," +
    culvert.exitLoss +
    "," +
    culvert.chart +
    "," +
    culvert.scale +
    "," +
    culvert.upstreamInvert +
    "," +
    culvert.downstreamInvert +
    "," +
    " " +
    culvert.numberOfBarrels +
    " " +
    "," +
    culvert.culvertGroupName +
    "  " +
    "," +
    " " +
    culvert.unknownFlag +
    " " +
    ","

  lines.push(connectionLine)

  // Barrel stations - format with 8 characters per number, 5 pairs per line
  if (culvert.barrelStations.length > 0) {
    lines.push(...formatStationPairs(culvert.barrelStations))
  }

  // Barrel definitions
  for (const barrel of culvert.barrels) {
    lines.push(...serializeCulvertBarrel(barrel))
  }

  // Optional properties
  if (culvert.nBottom !== undefined) {
    lines.push(`Conn Culv Bottom n=${culvert.nBottom}`)
  }

  if (culvert.nBottomDepth !== undefined) {
    lines.push(`Conn Culv Bottom Depth=${culvert.nBottomDepth}`)
  }

  if (culvert.depthBlocked !== undefined) {
    lines.push(`Conn Culv Depth Blocked=${culvert.depthBlocked}`)
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

  // Barrel definition line: Conn Culvert Barrel=index,name,numberOfCoordinates
  lines.push(`Conn Culvert Barrel=${barrel.index},${barrel.name},${barrel.coordinates.length}`)

  // Coordinate data if present
  if (barrel.coordinates.length > 0) {
    // Coordinates are formatted with 16 characters per number, 2 coordinates per line
    chunk(barrel.coordinates, 2).forEach((coordinatePair) => {
      const formattedLine = coordinatePair.map((coord) => coordinatePairToString(coord, 16)).join("")
      lines.push(formattedLine)
    })
  }

  return lines
}

/**
 * Serialize culvert groups to a complete HEC-RAS string
 * @param culvertGroups Array of culvert group properties
 * @returns Formatted HEC-RAS string
 */
export function serializeCulvertGroupsString(culvertGroups: CulvertGroupProperties[]): string {
  return serializeCulvertGroups(culvertGroups).join("\n")
  // There is an extra new line after culvertGroups are defined
}
