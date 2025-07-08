// Geometry header serializer for HEC-RAS format
// Reverses the header parsing process to produce exact format output

import type { HECRASGeometry, ViewingRectangle } from "../../models/geometry/geometryHeaders"
import { formatKeyValue, formatCommaSeparated } from "../atomic"

/**
 * Serialize geometry header to HEC-RAS format
 * @param geometry Geometry object containing header data
 * @returns Array of formatted header lines
 */
export function serializeGeometryHeader(geometry: HECRASGeometry): string[] {
  const lines: string[] = []

  // Geom Title
  lines.push(formatKeyValue("Geom Title", geometry.geomTitle))

  // Program Version
  lines.push(formatKeyValue("Program Version", geometry.programVersion))

  // Viewing Rectangle
  lines.push(formatKeyValue("Viewing Rectangle", formatViewingRectangle(geometry.viewingRectangle)))

  // Description (optional)
  if (geometry.description !== undefined) {
    lines.push(...formatDescription(geometry.description))
  }

  return lines
}

/**
 * Format viewing rectangle as comma-separated values
 */
function formatViewingRectangle(rectangle: ViewingRectangle): string {
  const values = [rectangle.left, rectangle.right, rectangle.top, rectangle.bottom]
  return formatCommaSeparated(values)
}

/**
 * Format description with BEGIN/END markers
 */
function formatDescription(description: string): string[] {
  const lines: string[] = []

  lines.push("BEGIN GEOM DESCRIPTION:")

  // Split description into lines and add each line
  const descriptionLines = description.split("\n")
  lines.push(...descriptionLines)

  lines.push("END GEOM DESCRIPTION:")

  return lines
}

/**
 * Serialize geometry header to a complete HEC-RAS string
 * @param geometry Geometry object containing header data
 * @returns Formatted HEC-RAS header string
 */
export function serializeGeometryHeaderString(geometry: HECRASGeometry): string {
  return serializeGeometryHeader(geometry).join("\n")
}
