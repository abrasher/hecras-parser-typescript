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
  const [sx, sy] = bc.startPosition
  lines.push(`BC Line Start Position= ${sx} , ${sy} `)

  // BC Line Middle Position
  const [mx, my] = bc.middlePosition
  lines.push(`BC Line Middle Position= ${mx} , ${my} `)

  // BC Line End Position
  const [ex, ey] = bc.endPosition
  lines.push(`BC Line End Position= ${ex} , ${ey} `)

  // BC Line Arc
  lines.push(...formatCoordinateMultipleLines("BC Line Arc", bc.arcCoordinates, true))

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
