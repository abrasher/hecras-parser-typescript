import type { BoundaryCondition } from "../../models/geometry/boundaryCondition"
import { formatCoordinateMultipleLines } from "../utils"

/**
 * Serialize boundary condition to HEC-RAS format
 * @param bc Boundary condition properties
 * @returns Array of formatted lines
 */
export function serializeBoundaryCondition(bc: BoundaryCondition): string[] {
  const lines: string[] = []

  // BC Line Name
  lines.push(`BC Line Name=${bc.name.padEnd(32)}`)

  // BC Line Storage Area
  lines.push(`BC Line Storage Area=${bc.storageArea.padEnd(16)}`)

  // BC Line Start Position
  lines.push(`BC Line Start Position= ${bc.startPosition.x} , ${bc.startPosition.y} `)

  // BC Line Middle Position
  lines.push(`BC Line Middle Position= ${bc.middlePosition.x} , ${bc.middlePosition.y} `)

  // BC Line End Position
  lines.push(`BC Line End Position= ${bc.endPosition.x} , ${bc.endPosition.y} `)

  // BC Line Arc
  lines.push(...formatCoordinateMultipleLines("BC Line Arc", bc.arcCoordinates))

  // BC Line Text Position
  lines.push(`BC Line Text Position= ${bc.textPosition.x} , ${bc.textPosition.y} `)

  return lines
}

/**
 * Serialize a boundary condition to a complete HEC-RAS string
 * @param boundaryCondition Boundary condition properties
 * @returns Formatted HEC-RAS string
 */
export function serializeBoundaryConditionString(boundaryCondition: BoundaryCondition): string {
  return serializeBoundaryCondition(boundaryCondition).join("\n")
}
