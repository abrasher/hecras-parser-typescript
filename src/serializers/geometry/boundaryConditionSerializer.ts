// Boundary condition serializer for HEC-RAS format
// Reverses the boundary condition parsing process to produce exact format output

import type { BoundaryCondition, TextPosition } from "../../models/geometry/boundaryCondition"
import type { Coordinate } from "../../models/geometry/common"
import { formatKeyValue, formatCoordinateLines } from "../atomic"

/**
 * Serialize boundary condition to HEC-RAS format
 * @param boundaryCondition Boundary condition properties
 * @returns Array of formatted lines
 */
export function serializeBoundaryCondition(boundaryCondition: BoundaryCondition): string[] {
  const lines: string[] = []

  // BC Line Name
  lines.push(formatKeyValue("BC Line Name", boundaryCondition.name))

  // BC Line Storage Area
  lines.push(formatKeyValue("BC Line Storage Area", boundaryCondition.storageArea))

  // BC Line Start Position
  lines.push(formatKeyValue("BC Line Start Position", formatCoordinateString(boundaryCondition.startPosition)))

  // BC Line Middle Position
  lines.push(formatKeyValue("BC Line Middle Position", formatCoordinateString(boundaryCondition.middlePosition)))

  // BC Line End Position
  lines.push(formatKeyValue("BC Line End Position", formatCoordinateString(boundaryCondition.endPosition)))

  // BC Line Arc
  lines.push(formatKeyValue("BC Line Arc", boundaryCondition.arc))

  // Arc coordinates (if any)
  if (boundaryCondition.arcCoordinates.length > 0) {
    const arcCoordinateLines = formatCoordinateLines(boundaryCondition.arcCoordinates)
    lines.push(...arcCoordinateLines)
  }

  // BC Line Text Position
  lines.push(formatKeyValue("BC Line Text Position", formatTextPositionString(boundaryCondition.textPosition)))

  return lines
}

/**
 * Format coordinate object to string format "x , y"
 */
function formatCoordinateString(coordinate: Coordinate): string {
  return `${coordinate.x} , ${coordinate.y}`
}

/**
 * Format text position object to string format "x , y"
 */
function formatTextPositionString(textPosition: TextPosition): string {
  return `${textPosition.x} , ${textPosition.y}`
}

/**
 * Serialize a boundary condition to a complete HEC-RAS string
 * @param boundaryCondition Boundary condition properties
 * @returns Formatted HEC-RAS string
 */
export function serializeBoundaryConditionString(boundaryCondition: BoundaryCondition): string {
  return serializeBoundaryCondition(boundaryCondition).join("\n")
}
