// Main geometry serializer for HEC-RAS format
// Integrates all component serializers to produce complete geometry files

import type { HECRASGeometry } from "../models/geometry/geometryHeaders"
import { serializeGeometryHeader } from "./geometry/geometryHeaderSerializer"
import { serializeStorageArea } from "./geometry/storageAreaSerializer"
import { serializeConnection } from "./geometry/connectionSerializer"
import { serializeBoundaryCondition } from "./geometry/boundaryConditionSerializer"
import { serializeBreakLine } from "./geometry/breakLineSerializer"
import { serializeJunction } from "./geometry/junctionSerializer"
import { serializeRiverReach } from "./geometry/riverReachSerializer"
import { appendLines } from "./utils/safeArrayUtils"

/**
 * Serialize complete HEC-RAS geometry to text format
 * @param geometry Complete HECRASGeometry object
 * @returns Array of formatted lines
 */
export function serializeGeometry(geometry: HECRASGeometry): string[] {
  const lines: string[] = []

  // 1. Serialize header section (title, version, viewing rectangle, description)
  appendLines(lines, serializeGeometryHeader(geometry))

  // 2. Serialize junctions in order
  for (const junction of geometry.junctions) {
    appendLines(lines, serializeJunction(junction))
    lines.push("")
  }

  // 3. Serialize river reaches in order
  for (const riverReach of geometry.riverReaches) {
    appendLines(lines, serializeRiverReach(riverReach))
    lines.push("")
  }

  // 4. Serialize storage areas in order
  for (const storageArea of geometry.storageAreas) {
    appendLines(lines, serializeStorageArea(storageArea))
    lines.push("")
  }

  // 5. Serialize break lines in order
  for (const breakLine of geometry.breakLines) {
    appendLines(lines, serializeBreakLine(breakLine))
  }

  // 6. Serialize connections in order
  for (const connection of geometry.connections) {
    appendLines(lines, serializeConnection(connection))
  }

  // 7. Serialize boundary conditions in order
  for (const boundaryCondition of geometry.boundaryConditions) {
    appendLines(lines, serializeBoundaryCondition(boundaryCondition))
  }

  // 8. Serialize global settings (appear at end of file)
  if (geometry.lcmannTime !== undefined) {
    lines.push(`LCMann Time=${geometry.lcmannTime}`)
  }
  if (geometry.lcmannRegionTime !== undefined) {
    lines.push(`LCMann Region Time=${geometry.lcmannRegionTime}`)
  }
  if (geometry.lcmannTable !== undefined) {
    lines.push(`LCMann Table=${geometry.lcmannTable}`)
  }
  if (geometry.chanStopCuts !== undefined) {
    lines.push(`Chan Stop Cuts=${geometry.chanStopCuts} `)
  }

  // Add empty lines before remaining settings (matches original format)
  if (
    geometry.useUserSpecifiedReachOrder !== undefined ||
    geometry.gisRatioCutsToInvert !== undefined ||
    geometry.gisLimitAtBridges !== undefined ||
    geometry.compositeChannelSlope !== undefined
  ) {
    lines.push("", "", "")
  }

  if (geometry.useUserSpecifiedReachOrder !== undefined) {
    lines.push(`Use User Specified Reach Order=${geometry.useUserSpecifiedReachOrder}`)
  }
  if (geometry.gisRatioCutsToInvert !== undefined) {
    lines.push(`GIS Ratio Cuts To Invert=${geometry.gisRatioCutsToInvert}`)
  }
  if (geometry.gisLimitAtBridges !== undefined) {
    lines.push(`GIS Limit At Bridges=${geometry.gisLimitAtBridges}`)
  }
  if (geometry.compositeChannelSlope !== undefined) {
    lines.push(`Composite Channel Slope=${geometry.compositeChannelSlope}`)
  }

  return lines
}

/**
 * Serialize complete HEC-RAS geometry to a string
 * @param geometry Complete HECRASGeometry object
 * @returns Formatted HEC-RAS geometry file content
 */
export function serializeGeometryString(geometry: HECRASGeometry): string {
  return serializeGeometry(geometry).join("\n") + "\n"
}
