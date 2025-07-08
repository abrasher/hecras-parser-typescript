// Main geometry serializer for HEC-RAS format
// Integrates all component serializers to produce complete geometry files

import type { HECRASGeometry } from "../models/geometry/geometryHeaders"
import { serializeGeometryHeader } from "./geometry/geometryHeaderSerializer"
import { serializeStorageArea } from "./geometry/storageAreaSerializer"
import { serializeConnection } from "./geometry/connectionSerializer"
import { serializeBoundaryCondition } from "./geometry/boundaryConditionSerializer"

/**
 * Serialize complete HEC-RAS geometry to text format
 * @param geometry Complete HECRASGeometry object
 * @returns Array of formatted lines
 */
export function serializeGeometry(geometry: HECRASGeometry): string[] {
  const lines: string[] = []

  // 1. Serialize header section (title, version, viewing rectangle, description)
  lines.push(...serializeGeometryHeader(geometry))

  // 2. Serialize storage areas in order
  for (const storageArea of geometry.storageAreas) {
    lines.push(...serializeStorageArea(storageArea))
  }

  // 3. Serialize connections in order
  for (const connection of geometry.connections) {
    lines.push(...serializeConnection(connection))
  }

  // 4. Serialize boundary conditions in order
  for (const boundaryCondition of geometry.boundaryConditions) {
    lines.push(...serializeBoundaryCondition(boundaryCondition))
  }

  return lines
}

/**
 * Serialize complete HEC-RAS geometry to a string
 * @param geometry Complete HECRASGeometry object
 * @returns Formatted HEC-RAS geometry file content
 */
export function serializeGeometryString(geometry: HECRASGeometry): string {
  return serializeGeometry(geometry).join("\n")
}
